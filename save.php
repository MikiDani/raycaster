<?php
if (isset($_POST['mapdata']))
{
    // $json_data = json_encode($_POST['map'], JSON_PRETTY_PRINT);
    $json_data = $_POST['mapdata'];

    if (file_put_contents('map.JSON', $json_data) !== false) {
        $message = "Sikeres mentés!";
        file_put_contents('log.txt', date('Y-m-d H:i:s') ." ". $message ." \r", FILE_APPEND);
        return $message;
    } else {
        $message = "Hiba történt a mentés során!";
        file_put_contents('log.txt', date('Y-m-d H:i:s') ." ". $message ." \r", FILE_APPEND);
        return $message;
    }
} 
else
    file_put_contents('log.txt', date('Y-m-d H:i:s') . 'MAPDATA is empty! \r', FILE_APPEND);
