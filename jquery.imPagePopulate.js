/*
 * 	 imPagePopulate - A JQuery Plugin
 * 	 @author Les Green
 * 	 Copyright (C) 2008 Intriguing Minds, Inc.
 *   Version 1.0
 * 
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.

 *   Demo and Documentation can be found at:   
 *   http://www.grasshopperpebbles.com
 *   
 */
 
;(function($) {
	$.fn.extend({
        imPagePopulate: function(options) { 
        	opts = $.extend({}, $.imPagePopulater.defaults, options);
            $this = $(this);
			return this.each(function() {
				new $.imPagePopulater(this, opts);
			});
        }
    });	

$.imPagePopulater = function(obj, opts) {
	var $this = $(obj);
	if (opts.input_map != '') {
		var d = getDataString();
		doAjax('GET', opts.data_url, d, '', doPopulate);
	}
	
	function getDataString() {
		var str = '';
		$.each(opts.data, function(i, itm) {
			str += itm.name + "=" + itm.value + "&";							
		});
		//remove last "&"
		str = str.substr(0, (str.length-1));
		return str;
	};
		
	function doAjax(t, u, d, fnBefore, fnSuccess) {
		$.ajax({
			type: t,
			url: u,
			data: d,
			dataType: 'json',
			beforeSend: fnBefore, //function(){$("#loading").show("fast");}, //show loading just when link is clicked
			//complete: function(){ $("#loading").hide("fast");}, //stop showing loading when the process is complete
			success: fnSuccess//{ //so, if data is retrieved, store it in html
	 	}); //close $.ajax(
	};
	
	function doPopulate(data) {
		populatePage(data, opts.db_map);
		//if other forms use the same data:
		if (opts.add_elements) {
			$.each(opts.add_elements, function(i, itm) {
				$this = $('#'+itm.id);
				populatePage(data, itm.db_map);
			});
		}
		if (opts.sub_map) {
			$.each(opts.sub_map, function(i, itm) {
				populatePage(data, itm.db_map);
			});
		}
		if (opts.success) {
			var fn = eval(opts.success);
			fn ();
		}
	};
	
	function populatePage(data, db_map) {
		var fieldVal;
		$.each(db_map, function(i, itm) {
			//console.log(data[0][itm.db_field][0].length);	
			//console.log(itm.db_map);
			if ((data[0][itm.name]) && (data[0][itm.name][0][itm.db_field])) {
				doMultValues(data, itm);	
			} else {
				fieldVal = getDBField(data, itm.db_field);
				if (itm.format) {
					fieldVal = doFormat(fieldVal, itm);	
				}
				if (itm.func) {
					var fn = eval(itm.func);
					fn (fieldVal);
				} else if (itm.form) {
				//if not a select, this first will be bypassed
					$("select[name=" + itm.name +"] option", $this).each(function () {
						if ($(this).val() == fieldVal) {
							//if option equals fieldVal from Json array, select the option
							$(this).attr("selected", "selected");
						}
		            		});

					$(":radio[name=" + itm.name +"]", $this).each(function() {
						if ($(this).val() == fieldVal) {
							$(this).attr("checked", "checked");
						}
					});
/*
If you still have problem when populate value using this plugin, it's best if you using a function to control how the populate working rather just inserting value to the form field


					$(":radio[name=" + itm.name +"]", $this).each(function() {
						var rad = $(this).attr("id");
						if (rad == fieldVal) {
							$(this).attr("checked", "checked");
							fieldVal = rad;
						} else {
							$(this).attr("checked", false);
							fieldVal = rad;
						}
					});
*/
					$(":checkbox[name=" + itm.name +"]", $this).each(function() {
						var cb = $(this).val();
						if (cb == fieldVal) {
							$(this).attr("checked", "checked");
						}
						fieldVal = cb;
					});

					$(":input[name=" + itm.name +"]", $this).val(fieldVal);
					
					//$("textarea[name=" + itm.name +"]", $this).val(fieldVal);
				} else {
					$("#"+itm.name).html(fieldVal);	
				}
			}
		});
	};
	
	function doMultValues(data, itm) {
		//var ln = $('[name^='+itm.format+']').length;
		//formatting is used to created multiple checkboxes on a page that are numbered sequentially. cbh_1, cbh_2, etc.
		var ln = data[0][itm.name].length;
		for (var j=0;j<ln;j++) {
			var fieldVal = data[0][itm.name][j][itm.db_field];
			if (itm.format) {
				fieldVal = doFormat(fieldVal, itm);	
			}
			if (itm.form) {
				if ($("input[name="+fieldVal+"]").length != 0) {
					if ($("input[name="+fieldVal+"]").attr("type") == 'checkbox') {
						$("input[name="+fieldVal+"]").attr("checked", "checked");
					}
				}
			} else {
				$("#"+itm.name).append(fieldVal);
			}
		}
	};
	
	function getDBField(data, fld) {
		var r = '';
		var v = fld.split(', ');
		if (v.length == 1) { 
			r = data[0][fld];
		} else {
			$.each(v, function(i, itm) {
				r += data[0][itm] + ', ';	
			});
			r = r.substr(0, r.length - 2);
		}
		return r;
	};
	
	function doFormat(v, itm) {
		//var v = '';
		$.each(itm.format, function(i, fmt) {
			switch (fmt.type) {
			//case "db": v = getDbField(data, fmt.name); break;	
			case "math": v = doMath(v, fmt); break;
			case "decper": v = doDecPer(v, fmt); break;
			case "decgoper": v = doDecGoPer(v); break;
			//affix must be called last when using multiple formatting. Get the value and then add prefix or suffix
			case "affix": v = doAffix(v, fmt); break;
			//don't need fmt.name for text
			//case "text": v = fmt.value; break;
			//case "regex": v = getRegex(row, map.value); break;
			}
		});
		
		//v = ((map.url) || (map.func)) ? getLink(row, map, v) : v;
		return v;
	};
	
	function doMath(val, fmt) {
		var r;
		switch (fmt.name) {
			case "round": r = Math.round(val); break;
			case "ceil": r = Math.ceil(val); break;
			case "floor": r = Math.floor(val); break;
			case "abs": r = Math.abs(val); break;
			case "multiply": r = val*fmt.value; break;
			case "divide": r = val/fmt.value; break;
			case "add": r = val + fmt.value; break;
			case "subtract": r = val - fmt.value; break;
		}
		return r;
	};
	
	function doDecPer(val) {
		var r;
		r = Math.round(val*100*Math.pow(10,2))/Math.pow(10,2)+' %';
		return r;
	};

	function doDecGoPer(val) {
		var r;
		r = val+' %';
		return r;
	};

	function doAffix(val, fmt) {
		var r;
		switch (fmt.name) {
			case "prefix": r = fmt.value + val; break;
			case "suffix": r = val + fmt.value; break;
		}
		return r;
	}
	
	/*function formatDate(date) {
		if (opts.date_format != '') {
			sep = opts.date_format['separator'];
			date = date.split(sep);
			switch (opts.date_format['display']) {
			case "mm/dd/yyyy":
				rDate = date[1] + '/' + date[2] + '/' + date[0];
				break;
			case "what":	
				y = substr(date,0,4);
				m = substr(date,5,2);
				d = substr(date,8,2);
				rDate =  m + '/' + d + '/' + y;
				break;
			}
		}
		return $rDate;
	};*/
};

$.imPagePopulater.defaults = {
	data_url: '',
	data: '',
	db_map: '',
	sub_map: '',
	date_format: '', //{"separator" : "-", "display": "mm/dd/yyyy"},
	add_elements: '',
	success: ''
};
})(jQuery);		   
