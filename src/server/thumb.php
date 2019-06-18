<?php 

function thumbRemoteImage($url, $sizes) {

  $imageFolder = __DIR__ . "/images/";

  $validExtensions = array(
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif', 
  );

  $mime = mime_content_type($url);

  if(!array_key_exists($mime, $validExtensions)) {
    throw new Exception('Cannot process file type ' . $mime);
  }

  $ext = $validExtensions[$mime];

  // TODO: copy url contents

  $result = [];
  foreach($sizes as $size => $dimensions) {
    // TODO: resize the image to their respective sizes
  }

  $fakeResponse = array(
      "small" => array(
          "type" => $ext,
          "url" => $url
      ),

      "medium" => array(
          "type" => $ext,
          "url" => $url
      ),

      "large" => array(
          "type" => $ext,
          "url" => $url
      )
  );

  return $fakeResponse;
}