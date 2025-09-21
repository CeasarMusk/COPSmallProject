const urlBase = 'http://www.somethingsimple.site/API';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

// Login and Register Code

//Login
function doLogin() {
    userId = 0;
    firstName = "";
    lastName = "";

    let login = document.getElementById("first").value;   
    let password = document.getElementById("password").value;

    if (!validLoginForm(login, password)) {
        document.getElementById("loginResult").innerHTML = "Invalid username or password format";
        return;
    }

    let tmp = { login: login, password: password }; 
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;

                if (userId < 1) {
                    document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
                    return;
                }

                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();
                window.location.href = "contacts.html"; 
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}

//Register
function doRegister() {
    firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;
    let username = document.getElementById("first").value;
    let password = document.getElementById("password").value;

    if (!validSignUpForm(firstName, lastName, username, password)) {
        document.getElementById("loginResult").innerHTML = "Invalid signup form fields";
        return;
    }

    let tmp = { firstName: firstName, lastName: lastName, login: username, password: password };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) return;

            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error && jsonObject.error.length > 0) {
                    document.getElementById("loginResult").innerHTML = jsonObject.error;
                    return;
                }

                userId = jsonObject.id;
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                document.getElementById("loginResult").innerHTML = "Account created successfully!";
                saveCookie();
                window.location.href = "contacts.html";
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}

//Logout
function doLogout() {
    userId = 0;
    firstName = "";
    lastName = "";

    document.cookie = "firstName= ; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "lastName= ; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userId= ; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    window.location.href = "index.html";
}

//Cookies
function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    document.cookie = "firstName=" + firstName +
        ",lastName=" + lastName +
        ",userId=" + userId +
        ";expires=" + date.toGMTString();
}

function readCookie() {
    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");

    for (let i = 0; i < splits.length; i++) {
        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");

        if (tokens[0] == "firstName") {
            firstName = tokens[1];
        }
        else if (tokens[0] == "lastName") {
            lastName = tokens[1];
        }
        else if (tokens[0] == "userId") {
            userId = parseInt(tokens[1].trim());
        }
    }

    if (userId < 0) {
        window.location.href = "index.html";
    } else {
        let userDisplay = document.getElementById("userName");
        if (userDisplay) {
            userDisplay.innerHTML = "Welcome, " + firstName + " " + lastName + "!";
        }
    }
}

//Validation
function validLoginForm(logName, logPass) {
    return !(logName === "" || logPass === "");
}

function validSignUpForm(fName, lName, user, pass) {
    return !(fName === "" || lName === "" || user === "" || pass === "");
}

// Contacts Code

// Add Contact
function addContact() {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phoneNum").value;

    let tmp = {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        UserID: userId 
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Create.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            loadContacts(); // refresh the table
        }
    };

    xhr.send(jsonPayload);

    // clear form fields
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phoneNum").value = "";
}


// Search Contacts
function searchContacts() {
    readCookie();

    let search = document.getElementById("search").value;
    let tmp = { search: search, userId: userId };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Read.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let jsonObject = JSON.parse(xhr.responseText);
            displayContacts(jsonObject.results);
        }
    };
    xhr.send(jsonPayload);
}


// Load and display 5 contacts, display the rest via searching
function loadContacts() {
    readCookie();

    let tmp = { search: "", userId: userId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Read.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let jsonObject = JSON.parse(xhr.responseText);

            let table = document.getElementById("contactsTable");
            table.innerHTML = ""; // clear old rows

            if (!jsonObject.results || jsonObject.results.length === 0) return;

            // Sort alphabetically
            jsonObject.results.sort((a, b) => {
                if (a.lastName.toLowerCase() < b.lastName.toLowerCase()) return -1;
                if (a.lastName.toLowerCase() > b.lastName.toLowerCase()) return 1;
                if (a.firstName.toLowerCase() < b.firstName.toLowerCase()) return -1;
                if (a.firstName.toLowerCase() > b.firstName.toLowerCase()) return 1;
                return 0;
            });

            // Only show the first 5
            let limitedResults = jsonObject.results.slice(0, 5);

            for (let contact of limitedResults) {
                let row = table.insertRow();

                row.insertCell(0).innerText = contact.firstName;
                row.insertCell(1).innerText = contact.lastName;
                row.insertCell(2).innerText = contact.email;
                row.insertCell(3).innerText = contact.phone;

                // Update button
                let updateBtn = document.createElement("button");
                updateBtn.innerText = "Update";
                updateBtn.onclick = function() { updateContact(contact.ID); };
                row.insertCell(4).appendChild(updateBtn);

                // Delete button
                let deleteBtn = document.createElement("button");
                deleteBtn.innerText = "Delete";
                deleteBtn.onclick = function() { deleteContact(contact.ID); };
                row.insertCell(5).appendChild(deleteBtn);
            }
        }
    };
    xhr.send(jsonPayload);
}


// Delete Contact
function deleteContact(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    let tmp = { ID: contactId, UserID: userId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Delete.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            loadContacts();
        }
    };

    xhr.send(jsonPayload);
}


// Update Contact
function updateContact(contactId) {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phoneNum").value;

    let tmp = {
        ID: contactId,
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        UserID: userId
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/UPDATE.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            loadContacts();
        }
    };

    xhr.send(jsonPayload);
}
