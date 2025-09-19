<?php
  // UpdateContact.php  // CHANGED: this file is for updating a contact

  $inData = getRequestInfo();

  // CHANGED: use consistent variable names + types (IDs as ints)
  $userId    = intval($inData["userId"]    ?? 0);   // CHANGED
  $contactId = intval($inData["contactId"] ?? 0);   // CHANGED
  $first     = trim($inData["firstName"]   ?? "");  // CHANGED
  $last      = trim($inData["lastName"]    ?? "");  // CHANGED
  $email     = trim($inData["email"]       ?? "");  // CHANGED
  $phone     = trim($inData["phone"]       ?? "");  // CHANGED

  // CHANGED: validate the fields we actually need for UPDATE
  if ($userId <= 0 || $contactId <= 0 || $first === "" || $last === "" || $email === "" || $phone === "") {
    returnWithError("Missing required field(s).");   // CHANGED
    exit;
  }

  $conn = new mysqli("localhost", "API", "!Password123b", "COP4331");
  if ($conn->connect_error) {
    returnWithError($conn->connect_error);
    exit;
  }

  $conn->set_charset("utf8mb4"); // OK

  // REMOVED: unique-login check from Register.php (not relevant for Contacts)

  // CHANGED: UPDATE the Contacts row owned by this user
  $stmt = $conn->prepare(
    "UPDATE Contacts
        SET FirstName = ?, LastName = ?, Email = ?, Phone = ?
      WHERE ID = ? AND userID = ?"                           // CHANGED
  );
  if (!$stmt) {
    returnWithError("Database error: " . $conn->error);      // CHANGED
    $conn->close();
    exit;
  }

  // CHANGED: bind correct vars + types (4 strings, 2 ints)
  $stmt->bind_param("ssssii", $first, $last, $email, $phone, $contactId, $userId);

  if ($stmt->execute()) {
    $updated = $stmt->affected_rows;                         // CHANGED
    $stmt->close();
    $conn->close();

    if ($updated > 0) {
      // CHANGED: return the contact that was updated (id + names); adjust as you like
      returnWithInfo($contactId, $first, $last);             // CHANGED
    } else {
      // 0 rows → not found, not owned by user, or no field actually changed
      returnWithError("Contact not found or no changes.");   // CHANGED
    }
  } else {
    $err = $stmt->error;
    $stmt->close();
    $conn->close();
    returnWithError($err ?: "Update failed.");               // CHANGED
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

  // NOTE: This helper still returns only id/first/last to match your current pattern.
  // If you want to include email/phone too, extend this JSON.
  function returnWithInfo($id, $first, $last) {              // CHANGED: used for update success
    sendResultInfoAsJson(
      '{"id":' . intval($id) .
      ',"firstName":"' . addslashes($first) .
      '","lastName":"' . addslashes($last) .
      '","error":""}'
    );
  }
?>
