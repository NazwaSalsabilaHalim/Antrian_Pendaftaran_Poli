<?php
// ambil counter
$grp = isset($_REQUEST['counter']) ? trim($_REQUEST['counter']) : 'widget';

// sanitasi sederhana biar aman
$grp = preg_replace('/[^a-zA-Z0-9_]/', '', $grp);

// file XML per counter
$xmlFile = 'widget_' . $grp . '.xml';

// fallback kalau file belum ada
if (!file_exists($xmlFile)) {
    $xmlFile = 'widget_default.xml';
}

// anti cache
$xmlFile .= '?ts=' . microtime(true);
?>

<script type="text/javascript">
(function () {

  // reset player lama
  var flashContainer = document.getElementById("flashPlayer");

  if (flashContainer) {
    flashContainer.innerHTML = "";
  }

  // buat player baru
  var so = new SWFObject(
    "playerMultipleList.swf",
    "mymovie",
    "0",
    "0",
    "7",
    "#FFFFFF"
  );

  so.addVariable("autoPlay", "yes");
  so.addVariable("repeat", "false");

  // XML playlist sesuai counter
  so.addVariable("playlistPath", "<?php echo $xmlFile; ?>");

  // render player
  so.write("flashPlayer");

})();
</script>