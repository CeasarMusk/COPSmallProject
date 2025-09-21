const urlBase = 'http://www.somethingsimple.site/API';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
let currentUpdateId = null;




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
            if (this.readyState == 4) {
                if (this.status == 200) {
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
                } else {
                    document.getElementById("loginResult").innerHTML = "Login failed. Please try again.";
                }
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}


function doRegister() {
    let fName = document.getElementById("firstName").value;
    let lName = document.getElementById("lastName").value;
    let username = document.getElementById("first").value;
    let password = document.getElementById("password").value;

    if (!validSignUpForm(fName, lName, username, password)) {
        document.getElementById("loginResult").innerHTML = "Invalid signup form fields";
        return;
    }

    let tmp = { firstName: fName, lastName: lName, login: username, password: password };
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
            } else {
                document.getElementById("loginResult").innerHTML = "Registration failed. Please try again.";
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
}


function doLogout() {
    userId = 0;
    firstName = "";
    lastName = "";

    document.cookie = "firstName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "lastName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    window.location.href = "index.html";
}


function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    
    
    document.cookie = `firstName=${encodeURIComponent(firstName)}; expires=${date.toUTCString()}; path=/`;
    document.cookie = `lastName=${encodeURIComponent(lastName)}; expires=${date.toUTCString()}; path=/`;
    document.cookie = `userId=${userId}; expires=${date.toUTCString()}; path=/`;
}

function readCookie() {
    userId = -1;
    firstName = "";
    lastName = "";
    
    
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const [name, value] = cookie.split('=');
        
        if (name === "firstName") {
            firstName = decodeURIComponent(value);
        } else if (name === "lastName") {
            lastName = decodeURIComponent(value);
        } else if (name === "userId") {
            userId = parseInt(value);
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


function validLoginForm(logName, logPass) {
    return !(logName === "" || logPass === "");
}

function validSignUpForm(fName, lName, user, pass) {
    return !(fName === "" || lName === "" || user === "" || pass === "");
}



function addContact() {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phoneNum").value;

    let tmp = {
        userId: userId,        
        firstName: firstName,  
        lastName: lastName,    
        phone: phone,          
        email: email           
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Create.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    alert("Error: " + jsonObject.error);
                } else {
                    loadContacts();
                }
            } else {
                alert("Failed to add contact. Please try again.");
            }
        }
    };

    xhr.send(jsonPayload);

    
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phoneNum").value = "";
}


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
        if (this.readyState == 4) {
            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    console.error("Error:", jsonObject.error);
                } else {
                    displayContacts(jsonObject.results);
                }
            } else {
                console.error("Search failed with status:", this.status);
            }
        }
    };
    xhr.send(jsonPayload);
}


function loadContacts() {
    readCookie();

    let tmp = { search: "", userId: userId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Read.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    console.error("Error:", jsonObject.error);
                } else {
                    displayContacts(jsonObject.results);
                }
            } else {
                console.error("Load contacts failed with status:", this.status);
            }
        }
    };
    xhr.send(jsonPayload);
}


function displayContacts(contacts) {
    let table = document.getElementById("contactsTable");
    table.innerHTML = "";

    if (!contacts || contacts.length === 0) {
        let row = table.insertRow();
        let cell = row.insertCell(0);
        cell.colSpan = 6;
        cell.innerText = "No contacts found";
        cell.style.textAlign = "center";
        return;
    }

    contacts.sort((a, b) => {
        if (a.LastName.toLowerCase() < b.LastName.toLowerCase()) return -1;
        if (a.LastName.toLowerCase() > b.LastName.toLowerCase()) return 1;
        if (a.FirstName.toLowerCase() < b.FirstName.toLowerCase()) return -1;
        if (a.FirstName.toLowerCase() > b.FirstName.toLowerCase()) return 1;
        return 0;
    });

    for (let contact of contacts) {
        let row = table.insertRow();
        row.insertCell(0).innerText = contact.FirstName;
        row.insertCell(1).innerText = contact.LastName;
        row.insertCell(2).innerText = contact.Email;
        row.insertCell(3).innerText = contact.Phone;

        let updateBtn = document.createElement("button");
        updateBtn.innerText = "Update";
        updateBtn.onclick = function() {
            setUpdateForm(contact.ID, contact.FirstName, contact.LastName, contact.Email, contact.Phone);
        };
        row.insertCell(4).appendChild(updateBtn);

        let deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = function() {
            deleteContact(contact.ID);
        };
        row.insertCell(5).appendChild(deleteBtn);
    }
}


function deleteContact(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    let tmp = { contactId: contactId, userId: userId };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Delete.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    alert(jsonObject.error);
                } else {
                    loadContacts();
                }
            } else {
                alert("Delete failed. Please try again.");
            }
        }
    };
    xhr.send(jsonPayload);
}


function setUpdateForm(id, first, last, email, phone) {
    document.getElementById("firstName").value = first;
    document.getElementById("lastName").value = last;
    document.getElementById("email").value = email;
    document.getElementById("phoneNum").value = phone;

    currentUpdateId = id;

    let saveButton = document.querySelector("#contactForm button[type='submit']");
    saveButton.textContent = "Update Contact";
}


function updateContact() {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phoneNum").value;

    let tmp = {
        contactId: currentUpdateId,
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/UPDATE.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    alert(jsonObject.error);
                } else {
                   
                    currentUpdateId = null; 
                    document.getElementById("firstName").value = "";
                    document.getElementById("lastName").value = "";
                    document.getElementById("email").value = "";
                    document.getElementById("phoneNum").value = "";

                    let saveButton = document.querySelector("#contactForm button[type='submit']");
                    saveButton.textContent = "Save Contact";

                    loadContacts();
                }
            } else {
                alert("Update failed. Please try again.");
            }
        }
    };
    xhr.send(jsonPayload);
}


function debugLog(message) {
    console.log(message);
}

function handleContactForm() {
    if (currentUpdateId !== null) {
        updateContact();
    } else {
        addContact();
    }
}

