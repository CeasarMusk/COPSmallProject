<?php
  // UPDATE.php 
  $inData = getRequestInfo();

  $userId    = intval($inData["userId"] ?? 0);
  $contactId = intval($inData["contactId"] ?? 0);
  $first     = trim($inData["firstName"] ?? "");
  $last      = trim($inData["lastName"] ?? "");
  $email     = trim($inData["email"] ?? "");
  $phone     = trim($inData["phone"] ?? "");

  if ($userId <= 0 || $contactId <= 0 || $first === "" || $last === "" || $email === "") {
    returnWithError("Missing required field(s).");
    exit;
  }

  $conn = new mysqli("localhost", "API", "!Password123b", "COP4331");
  if ($conn->connect_error) {
    returnWithError($conn->connect_error);
    exit;
  }

  $conn->set_charset("utf8mb4");

  // UPDATE the Contacts row owned by this user
  $stmt = $conn->prepare(
    "UPDATE Contacts 
        SET FirstName = ?, LastName = ?, Email = ?, Phone = ?
      WHERE ID = ? AND userID = ?"
  );
  
  if (!$stmt) {
    returnWithError("Database error: " . $conn->error);
    $conn->close();
    exit;
  }

  $stmt->bind_param("ssssii", $first, $last, $email, $phone, $contactId, $userId);

  if ($stmt->execute()) {
    $updated = $stmt->affected_rows;
    $stmt->close();
    $conn->close();

    if ($updated > 0) {
      returnWithInfo($contactId, $first, $last);
    } else {
      // 0 rows → not found, not owned by user, or no field actually changed
      returnWithError("Contact not found or no changes.");
    }
  } else {
    $err = $stmt->error;
    $stmt->close();
    $conn->close();
    returnWithError($err ?: "Update failed.");
  }

  // ------------ helpers ------------
  function getRequestInfo() {
    return json_decode(file_get_contents('php://input'), true);
  }

  function sendResultInfoAsJson($obj) {
    header('Content-type: application/json');
    echo $obj;
  }

  function returnWithError($err) {
    sendResultInfoAsJson('{"error":"' . $err . '"}');
  }

  function returnWithInfo($id, $first, $last) {
    sendResultInfoAsJson(
      '{"id":' . intval($id) .
      ',"firstName":"' . addslashes($first) .
      '","lastName":"' . addslashes($last) .
      '","error":""}'
    );
  }
?>
