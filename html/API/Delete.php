<?php

    $inData = getRequestInfo();
    
    

    $conn = new mysqli("localhost", "API", "!Password123b", "COP4331"); 
    $conn->set_charset("utf8mb4"); 

    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
        
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND userID=?"); 
        $stmt->bind_param(
            "ii",
            $inData["contactId"],   
            $inData["userId"]       
        ); 

        
        $stmt->execute(); 

        if( $stmt->affected_rows > 0 ) 
        {
            
            sendResultInfoAsJson('{"error":""}'); 
        }
        else
        {
            
            returnWithError("Not found or not owned by user"); 
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
        
        $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
    
    
    function returnWithInfo( $firstName, $lastName, $id )
    {
        $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
        sendResultInfoAsJson( $retValue );
    }
    
?>

