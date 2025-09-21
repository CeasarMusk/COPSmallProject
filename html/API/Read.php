<?php

$inData = getRequestInfo();

error_log("READ.PHP Received: " . print_r($inData, true));

$userId = intval($inData["userId"] ?? 0);
$search = trim($inData["search"] ?? "");

if ($userId <= 0) {
    returnWithError("Missing or invalid userId.");
    exit;
}

$conn = new mysqli("localhost", "API", "!Password123b", "COP4331");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    returnWithError("Database connection error: " . $conn->connect_error);
    exit;
}


$userCheck = $conn->prepare("SELECT ID FROM Users WHERE ID = ?");
$userCheck->bind_param("i", $userId);
$userCheck->execute();
$userCheck->store_result();

if ($userCheck->num_rows === 0) {
    $userCheck->close();
    $conn->close();
    returnWithError("User not found.");
    exit;
}
$userCheck->close();

if ($search !== "") {
    $search = "%" . $search . "%";
    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE userID=? AND (FirstName LIKE ? OR LastName LIKE ?)");
    $stmt->bind_param("iss", $userId, $search, $search);
} else {
    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE userID=?");
    $stmt->bind_param("i", $userId);
}

$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}


error_log("Found " . count($contacts) . " contacts for user " . $userId);

if (count($contacts) > 0) {
    returnWithInfo($contacts);
} else {
    returnWithError("No contacts found.");
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
    sendResultInfoAsJson('{"results":[], "error":"' . $err . '"}');
}

function returnWithInfo($contacts) {
    sendResultInfoAsJson('{"results":' . json_encode($contacts) . ',"error":""}');
}
?>

