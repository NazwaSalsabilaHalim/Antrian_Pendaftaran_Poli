<?php
// Listed by  : Heri
// Start      : Nov 12, 2011 (PKU)

require "db.mysql.php";
require "connectdb.php";

function e($string) {
  return htmlspecialchars($string);
}
?>
<!DOCTYPE html>
<HTML>
<HEAD>
  <TITLE>Display Antrian</TITLE>
  <link rel="stylesheet" type="text/css" href="../jquery-ui.min.css" />
  <link rel="stylesheet" type="text/css" href="../jquery-ui.structure.min.css" />
  <link rel="stylesheet" type="text/css" href="../jquery-ui.theme.min.css" />
  <link rel="stylesheet" type="text/css" href="index.css" />
  <script type="text/javascript" src="../jquery-1.11.1.min.js"></script>
  <script type="text/javascript" src="../jquery-ui.min.js"></script>
  <script type="text/javascript" src="swfobject.js"></script>
  <script src="jwplayer.js"></script>
  <script src="jwplayer.html5.js"></script>
 </HEAD>

<BODY>
  <script type="text/javascript">

  jQuery(function($) {
    "use strict";

    $('div.container').show(function() {
      /**
       * ========================================================================
       * Video Playlist
       * ========================================================================
       */
      $('#TampilVideo').show(function() {
        var videoArea = $('video#video-area');
        if (videoArea.attr('src') == '') {
          var first = $('ul#video-playlist li')[0];
          var src = $(first).attr('data-video-uri'),
              type = $(first).attr('data-video-type');

          videoArea.attr('src', src);
          videoArea.attr('type', type);
        }

        videoArea.on("ended", function(e) {
          e.preventDefault();

          var list = $('ul#video-playlist li');
          var now = $('ul#video-playlist li[data-video-uri="' + $(this).attr('src') + '"]');
          var next = now.next();
          var src, type;

          if (next.length === 0) {
            src = $(list[0]).attr('data-video-uri');
            type = $(list[0]).attr('data-video-type');
          } else {
            src = next.attr('data-video-uri');
            type = next.attr('data-video-type');
          }

          $(this).attr('src', src);
          $(this).attr('type', type);
        });
      });

      $('#TampilAntrian').show(function() {
        var disp = 1,
            _$this = $(this);

        setInterval(function() {
          $.ajax({
            url: "tampil.php",
            type: "POST",
            data: {
              "disp": disp
            },
            dataType: "json",
            success: function(d, x, XHR) {
              console.log(d);
              var dispContainer = _$this.find('#counter_' + d.counter_id);

              var panggilIDLama = parseInt(dispContainer.attr('data-panggil-id')) || 0;

              var panggil = parseInt(d.panggil_id);

              console.log(d);

              if (
                    (panggil > 0 && panggil !== panggilIDLama) ||
                    (panggil === panggilIDLama && d.panggil_ulang === true)
                ) {
                dispContainer.attr('id', "counter_" + d.counter_id);
                dispContainer.attr('data-panggil-id', d.panggil_id);
                dispContainer.find('.queuetitle').text(d.counter_nama);
                dispContainer.find('.queuenumber').text(d.nomor);

                jalankan(d.panggil_id);
                middleEl($('#TampilAntrian'));
                middleEl($('#TampilVideo > #video-area'));
              } else {
                return false;
              }
            }
          });
        }, 10000);
      });

    });

    $(window).resize(function() {
      middleEl($('#TampilAntrian'));
      middleEl($('#TampilVideo > #video-area'));
    });
  });

  function playQueue(sounds) {

    let player = document.getElementById("audio-player");

    let index = 0;

    function playNext() {

        if(index >= sounds.length){
            return;
        }

        player.pause();
        player.currentTime = 0;

        player.src = sounds[index];

        player.play().catch(function(err){
            console.log(err);
        });

        player.onended = function() {
            index++;
            playNext();
        };
    }

    playNext();
  }

  function jalankan(PanggilID){

      $.post('panggil.php', { "PanggilID": PanggilID }, function(dat){

          var data = dat.split('|');

          console.log(data);

          if(data[0] == 'kosong'){
              return;
          }

          let nomor = data[0].trim();
          let prefix = data[1].trim();
          let loket = data[2].trim();

          let suara = [];

          suara.push('sounds_jelek/tingtong.mp3');

          suara.push('sounds_jelek/nomorantrian.mp3');

          if(prefix != ''){
              suara.push('sounds_jelek/' + prefix + '.mp3');
          }

          nomor = parseInt(nomor);

            // 1 - 9
            if(nomor <= 9){

                suara.push('sounds_jelek/' + nomor + '.mp3');

            }

            // 10
            else if(nomor == 10){

                suara.push('sounds_jelek/10.mp3');

            }

            // 11
            else if(nomor == 11){

                suara.push('sounds_jelek/11.mp3');

            }

            // 12 - 19
            else if(nomor >= 12 && nomor <= 19){

                let satuan = nomor.toString().substring(1);

                suara.push('sounds_jelek/' + satuan + '.mp3');
                suara.push('sounds_jelek/belas.mp3');

            }

            // 20 - 99
            else if(nomor >= 20 && nomor <= 99){

                let angkaString = nomor.toString();

                let puluhan = angkaString.charAt(0);
                let satuan  = angkaString.charAt(1);

                // contoh: 2.mp3
                suara.push('sounds_jelek/' + puluhan + '.mp3');

                // puluh.mp3
                suara.push('sounds_jelek/puluh.mp3');

                // kalau bukan nol
                if(satuan != '0'){
                    suara.push('sounds_jelek/' + satuan + '.mp3');
                }

            }

          suara.push('sounds_jelek/keloket.mp3');

         if(loket != ''){

              // ambil angka dari C1 -> 1
              let nomorLoket = loket.replace(/\D/g,'');

              suara.push('sounds_jelek/' + nomorLoket + '.mp3');
          }


          playQueue(suara);

      });
  }

  function setGroup(e){
    e.preventDefault();

    $('.container').show();

    /**
     * ========================================================================
     * Video Playlist
     * ========================================================================
     */
    $('#TampilVideo').show();
    var videoArea = $('video#video-area');
    if (videoArea.attr('src') == '') {
      var first = $('ul#video-playlist li')[0];
      var src = $(first).attr('data-video-uri'),
          type = $(first).attr('data-video-type');

      videoArea.attr('src', src);
      videoArea.attr('type', type);
    }

    videoArea.on("ended", function(e) {
      e.preventDefault();

      var list = $('ul#video-playlist li');
      var now = $('ul#video-playlist li[data-video-uri="' + $(this).attr('src') + '"]');
      var next = now.next();
      var src, type;

      if (next.length === 0) {
        src = $(list[0]).attr('data-video-uri');
        type = $(list[0]).attr('data-video-type');
      } else {
        src = next.attr('data-video-uri');
        type = next.attr('data-video-type');
      }

      $(this).attr('src', src);
      $(this).attr('type', type);
    });

    /**
     * ========================================================================
     * Antrian Display
     * ========================================================================
     */
    $('#setAntrian').hide();
    $('#TampilAntrian').show();
    var Disp = 1;

    $.post('tampil.php', { disp:Disp }, function(msg){

      var $container = $('#TampilAntrian');

      if(msg == null){
        alert('Pencarian data tidak ditemukan');
        $('#setAntrian').show();
        $('#TampilAntrian').hide();
        return;
      }

      $.each(msg, function(i, v) {
        var widgetID = (i + 1),
            widget = $container.find('div#counter_' + widgetID);

        if (widget.length === 0) {
          $container.prepend( $('<div id="counter_' + widgetID + '" />') );
          widget = $container.find('div#counter_' + widgetID);
        }

        var query = {
          CounterID: v.CounterID,
          TombolID: v.TombolID,
          w: widgetID
        };
        widget.load("_queue.php", $.param(query));
      });

      middleEl($('#TampilAntrian'));
      middleEl($('#TampilVideo > #video-area'));

      return false;
    }, 'json' );

    return false;
  } // end funct setGroup();

  function middleEl(target) {
    var winH, targetH, margin;

    winH = $(window).outerHeight();
    targetH = target.outerHeight();

    margin = (winH - targetH) / 2;

    target.animate({
      "margin-top": margin
    }, "fast", "swing");
  }

    function enableAudio(){

      let audio = document.getElementById("audio-player");

      audio.play()
      .then(() => {
          audio.pause();

          document.getElementById("btn-audio").style.display = 'none';
      })
      .catch((e) => {
          console.log(e);
      });
  }
  </script>
  


  <div id="setAntrian" style="display:none;margin-left:20px;margin-top:20px">
    <table class='SetTitle'>

      <div style="text-align:center">
        <p>Pilih nomer display antrian terlebih dahulu.</p>
        <label>Nomer Display:</label>
        <input type=text id='DispAntrian' name='DispAntrian' size=3 />
        <input type=button id='btn_submit_disp_antrian' name='btn_submit_disp_antrian'
      value='Tampilkan Antrian' onclick="return setGroup(jQuery.Event(event));"/>
      </div>
    </table>
  </div>

  <audio id="audio-player"></audio>

  <div class="container" style="display: none;">
    <div id="TampilAntrian" style="display: none; margin-top: 0;">
<?php
$qCntr = "SELECT * FROM counter WHERE NA = 'N'";
$rCntr = _query($qCntr);
if (_num_rows($rCntr) > 0) :
  $i = 0;
  $r = 1;
  echo '<div id="row_'.$r.'" class="counter_row">';
  while ($dtCntr = _fetch_array($rCntr)) :
    $i++;
?>
      <div id="<?= "counter_" . e($dtCntr['CounterID']) ?>" class="widget-container" data-panggil-id="">
        <div class="queuetitle"><?= e($dtCntr['Nama']) ?></div>
        <div class="queuenumber">-</div>
      </div>
    <?php if ($i % 2 === 0) : ?>
    </div>
    <div id="row_<?= $r ?>" class="counter_row">
    <?php endif; ?>
<?php
    $r++;
  endwhile;
endif;
?>
    </div>

    <?php
    /**
     * Disable Video
    <div id="TampilVideo" style="display: none;">
        <div id="video-area"></div>
        <script>
      <?php
        /**
         * JWPlayer Setup
         *
      require "config.php";
      if (count($video) > 0) :
        foreach ($video as $file => $mime) :
          $videoPath = VIDEO_URL . "/{$file}";
          $list[] = <<<LST
{
  sources: [{
    file: "{$videoPath}"
  }]
}
LST;
      endforeach;

      $playlist = implode(",", $list);
      echo <<<JS
  var playlist = [{$playlist}]
JS;
      ?>

        jwplayer('video-area').setup({
          aspectratio: "16:9",
          width: "100%",
          autostart: true,
	repeat: true,
          playlist: playlist,
          sketch: "fill"
        });
        jwplayer(0).setVolume(10);
      <?php endif; ?>
      </script>
    </div>
  </div>
     */
    ?>

  <div class="footer">
    <marquee>Selamat datang di Rumah Sakit Awal Bros Yasmine Dumai, Konfirmasi ke Admission apabila anda mengalami keterlambatan</marquee>
  </div>
  
  <button onclick="enableAudio()" id="btn-audio">
  Aktifkan Audio
  </button>
</BODY>


</HTML>
