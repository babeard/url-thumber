<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/thumb.php';

$klein = new \Klein\Klein();

// Note: Since we are not using php's builtin server to serve static assets,
// we need to handle that here. Otherwise in production, we would let
// nginx or apache handle it.
$klein->respond('GET', '/?[:asset]?', function($request, $response) {
  if (!$request->asset) {
    readfile('./public/index.html');
  } else {
    $filename = './public/' . $request->asset;

    // Define custom mime types because magic mime is currently not present
    $ext = strtolower(array_pop(explode('.',$request->asset)));
    $mime_types = array(
      'txt' => 'text/plain',
      'htm' => 'text/html',
      'html' => 'text/html',
      'css' => 'text/css',
      'js' => 'application/javascript',
      'json' => 'application/json',
    );

    $mime = mime_content_type($filename); // Just returns text/plain because missing magic mime
    if (array_key_exists($ext, $mime_types)) {
      $mime = $mime_types[$ext];
    }

    $response->header('Content-Type', $mime);
    $response->sendHeaders();

    readfile($filename);
  }
});

$klein->respond('GET', '/images/[:size]/[:filename]', function($request, $response){
  $f = __DIR__ . '/images/' . $request->size . '/' . $request->filename;

  $mime = mime_content_type($f);
  $response->header('Content-Type', $mime);
  $response->sendHeaders();

  readfile($f);
});

$klein->respond('POST', '/images', function($request, $response) {

  $accepted_domains = ['https://babeard.com', 'https://images.unsplash.com'];

  $sizes = [
    'small' => [300, 300],
    'medium' => [600, 600],
    'large' => [1000, 1000]
  ];

  $body = json_decode($request->body(), true);

  if(!array_key_exists('remoteImage', $body)) {
    $response->code(400); // Bad Request
    return;
  }

  $url = $body['remoteImage'];
  $is_acceptable = false;
  foreach($accepted_domains as $domain) {
    if (stripos(substr($url, 0, 30), $domain) !== false) {
      $is_acceptable = true;
    }
  }

  if (!$is_acceptable){
    $response->code(403); // Forbidden
    return;
  }

  try {
    $results = thumbRemoteImage($url, $sizes);
  } catch (Exception $e) {
    $response->code(422); // Unprocessable Entity
    return;
  }

  $response->json($results);
});

$klein->dispatch();
