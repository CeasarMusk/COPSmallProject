<?php

$inData = getRequestInfo();


$userId = intval($inData["userId"] ?? 0);
$first = trim($inData["firstName"] ?? "");
$last = trim($inData["lastName"] ?? "");
$phone = trim($inData["phone"] ?? "");
$email = trim($inData["email"] ?? "");


if ($userId <= 0 || $first === "" || $last === "" || $email === "") {
    returnWithError("Missing required field(s).");
    exit;
}

$conn = new mysqli("localhost", "API", "!Password123b", "COP4331");
if ($conn->connect_error) {
    returnWithError("Database connection error: " . $conn->connect_error);
    exit;
}

$conn->set_charset("utf8mb4");

$stmt = $conn->prepare("INSERT INTO Contacts (userID, FirstName, LastName, Phone, Email) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issss", $userId, $first, $last, $phone, $email);

if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    returnWithInfo($newId);
} else {
    returnWithError("Failed to create contact: " . $stmt->error);
}

$stmt->close();
$conn->close();


function getRequestInfo() {
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj) {
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err) {
    sendResultInfoAsJson('{"id":0, "error":"' . $err . '"}');
}

function returnWithInfo($id) {
    sendResultInfoAsJson('{"id":' . $id . ', "error":""}');
}

?>
