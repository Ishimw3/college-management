<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$TWILIO_ACCOUNT_SID = 'AC9a93011daf5337b282e298216aa53929';
$TWILIO_AUTH_TOKEN = 'fba576c39333156998611b96a47b02df';
$TWILIO_PHONE_NUMBER = '+17854250457';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['to']) || !isset($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters']);
        exit;
    }

    $url = "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json";
    
    $payload = http_build_query([
        'To' => $data['to'],
        'From' => $TWILIO_PHONE_NUMBER,
        'Body' => $data['message']
    ]);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_USERPWD, "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    http_response_code($status_code);
    echo $response;
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
