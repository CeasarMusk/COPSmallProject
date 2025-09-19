<?php
// Expecting JSON: { "userId":9 }

$inData = getRequestInfo();
$userId = intval($inData["userId"] ?? 0);

if ($userId <= 0) {
  returnWithError("Missing or invalid userId.");
  exit;
}

$conn = new mysqli("localhost", "API", "!Password123b", "COP4331");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
  returnWithError($conn->connect_error);
  exit;
}

$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE userID=?");
$stmt->bind_param("i", $userId);
$stmt->execute();

$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
  $contacts[] = $row;
}

if (count($contacts) > 0) {
  returnWithInfo($contacts);
} else {
  returnWithError("No contacts found.");
}

$stmt->close();
$conn->close();


// -------- Helpers ----------
function getRequestInfo() {
  return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj) {
  header('Content-type: application/json');
  echo $obj;
}

function returnWithError($err) {
  sendResultInfoAsJson('{"results":[],"error":"' . $err . '"}');
}

function returnWithInfo($contacts) {
  sendResultInfoAsJson(json_encode(["results" => $contacts, "error" => ""]));
}
?>
