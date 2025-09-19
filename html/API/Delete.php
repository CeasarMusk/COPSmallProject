<?php
//LOGIN TO DELETE
    $inData = getRequestInfo();
    
    // REMOVED: $id/$firstName/$lastName (not needed for delete)

    $conn = new mysqli("localhost", "API", "!Password123b", "COP4331"); // same DB creds
    $conn->set_charset("utf8mb4"); // keep

    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
        // CHANGED: new SQL for delete + different parameters
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND userID=?"); // CHANGED
        $stmt->bind_param(
            "ii",
            $inData["contactId"],   // CHANGED: was login
            $inData["userId"]       // CHANGED: was password
        ); // CHANGED

        // CHANGED: execute and check affected rows instead of fetching a row
        $stmt->execute(); // CHANGED

        if( $stmt->affected_rows > 0 ) // CHANGED
        {
            // CHANGED: simple “OK” response for deletes
            sendResultInfoAsJson('{"error":""}'); // CHANGED
        }
        else
        {
            // CHANGED: not found or not owned by this user
            returnWithError("Not found or not owned by user"); // CHANGED
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
        // NOTE: kept the same helper; it includes id/firstName/lastName keys,
        // which are harmless here. If you prefer a minimal shape, replace with:
        // sendResultInfoAsJson('{"error":"' . $err . '"}');
        $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
    
    // NOTE: returnWithInfo not used by Delete; safe to keep or remove.
    function returnWithInfo( $firstName, $lastName, $id )
    {
        $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
        sendResultInfoAsJson( $retValue );
    }
    
?>
