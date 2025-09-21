<?php
  
  $inData = getRequestInfo();

  
  $first = trim($inData["firstName"] ?? "");
  $last  = trim($inData["lastName"]  ?? "");
  $login = trim($inData["login"]     ?? "");
  $pass  = trim($inData["password"]  ?? "");

  if ($first === "" || $last === "" || $login === "" || $pass === "") {
    returnWithError("Missing required field(s).");
    exit;
  }

  $conn = new mysqli("localhost", "API", "!Password123b", "COP4331");
  if ($conn->connect_error) {
    returnWithError($conn->connect_error);
    exit;
  }

  
  $conn->set_charset("utf8mb4");

  
  $check = $conn->prepare("SELECT ID FROM Users WHERE Login=? LIMIT 1");
  $check->bind_param("s", $login);
  $check->execute();
  $check->store_result();

  if ($check->num_rows > 0) {
    $check->close();
    $conn->close();
    returnWithError("Login already exists.");
    exit;
  }
  $check->close();

   $stmt = $conn->prepare(
    "INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?,?,?,?)"
  );
  $stmt->bind_param("ssss", $first, $last, $login, $pass);

  if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    $stmt->close();
    $conn->close();
    returnWithInfo($newId, $first, $last);
  } else {
    $err = $stmt->error;
    $stmt->close();
    $conn->close();
    returnWithError($err ?: "Insert failed.");
  }

  
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


