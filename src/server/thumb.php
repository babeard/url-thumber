<?php

function thumbRemoteImage($url, $sizes) {

  // Whitelist of accepted extensions
  $validExtensions = array(
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
  );

  $headers = get_headers($url, 1);

  // Check remote response was 200 and Content-Type exists
  if(!strpos($headers[0], '200') || !array_key_exists('Content-Type', $headers)) {
    throw new Exception('Cannot load url ' . $url);
  }

  $mime = $headers['Content-Type'];

  // Only whitelisted file types
  if(!array_key_exists($mime, $validExtensions)) {
    throw new Exception('Cannot process file type ' . $mime);
  }

  $ext = $validExtensions[$mime];

  $contents = file_get_contents($url);

  $img = imagecreatefromstring($contents);

  // Original dimensions
  $oWidth = imagesx($img);
  $oHeight = imagesy($img);

  $result = [];
  foreach($sizes as $size => $dimensions) {

    // Hash url for filename in case of collision.
    // Example `a.com/cat.jpg` <-> `b.com/cat.jpg` will collide
    // if we save plain filename `cat.jpg` on fs.
    $newurl = 'images/' . $size . '/' . md5($url) . '.' . $ext;
    $save = __DIR__ . '/' . $newurl;
    
    $nWidth = $dimensions[0];
    $nHeight = $dimensions[1];

    $thumb = imagecreatetruecolor($nWidth, $nHeight);

    switch($ext) {
      case 'jpg':
        imagejpeg($thumb, $save);
        break;
      case 'png':
        imagealphablending($thumb, false);
        imagesavealpha($thumb, true);

        imagecopyresampled( $thumb, $img, 0,0,0,0, $nWidth, $nHeight, $oWidth, $oHeight);

        imagepng($thumb, $save);
        break;
      case 'gif':
        $transparency = imagecolortransparent($img);
        $palletsize = imagecolorstotal($img);

        if ($transparency >= 0 && $transparency < $palletsize) {
          $tcolor  = imagecolorsforindex($img, $transparency);
          $transparency = imagecolorallocate($thumb, $tcolor['red'], $tcolor['green'], $tcolor['blue']);
          imagefill($thumb, 0, 0, $transparency);
          imagecolortransparent($thumb, $transparency);
        }

        imagecopyresampled($thumb, $img, 0,0,0,0, $nWidth, $nHeight, $oWidth, $oHeight);
        imagegif($thumb, $save);
        break;
    }

    imagedestroy($thumb);

    $result[$size] = array('type' => $ext, 'url' => $newurl);
  }

  imagedestroy($img);

  return $result;
}