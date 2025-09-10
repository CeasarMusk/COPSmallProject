const urlBase = 'http://somethingsimple.site/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

//Login
function doLogin() {
    userId = 0;
    firstName = "";
    lastName = "";

    //username+password fields
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
                // EDIT THIS CODE ONCE THE HTML FILE FOR THE ACTUAL PAGE IS GOOD.
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
    //register information fields
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
