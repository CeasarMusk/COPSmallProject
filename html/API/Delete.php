<?php
// Delete.php
$inData = getRequestInfo();
    
// Get parameters
$contactId = intval($inData["contactId"] ?? 0);
$userId = intval($inData["userId"] ?? 0);

// Validate parameters
if ($contactId <= 0 || $userId <= 0) {
    returnWithError("Invalid parameters.");
    exit;
}

$conn = new mysqli("localhost", "API", "!Password123b", "COP4331");
$conn->set_charset("utf8mb4");

if( $conn->connect_error )
{
    returnWithError( $conn->connect_error );
}
else
{
    // Prepare and execute delete statement
    $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND userID = ?");
    $stmt->bind_param("ii", $contactId, $userId);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            // Successfully deleted
            sendResultInfoAsJson('{"success": "Contact deleted successfully.", "error": ""}');
        } else {
            // No rows affected - contact not found or not owned by user
            returnWithError("Contact not found or not owned by user.");
        }
    } else {
        returnWithError("Database error: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();
}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson( $obj )
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError( $err )
{
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson( $retValue );
}
?>
