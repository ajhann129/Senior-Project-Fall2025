const createAccButton = document.getElementById('createAccButton');
const createEmail = document.getElementById('createEmail');
const createUsername = document.getElementById('createUsername');
const createPw = document.getElementById('createPw');
const pwConf = document.getElementById('pwConf');


// Function to validate form input
function validateForm() {

    // Declaring boolean variables for result
    let validateEmail, validateUsername, validatePassword;

    // Validation for email
    const emailReq = /^[a-z A-Z]+@[a-z A-Z]+\.[a-z A-Z]{2,}$/;
    const email = createEmail.value.toString();

    // If the email matches requirements, remove any warnings and turn border green
    if (email.match(emailReq)) {
        createEmail.style.borderColor = 'green';

        emailWarning = document.getElementById('emailWarning');
        if (emailWarning) emailWarning.remove();

        validateEmail = true;
    }

    else {
        
        // If the email fails validation, turn border red and display warning
        if (createEmail.style.borderColor != 'red') {
            createEmail.style.borderColor = 'red';

            let warning = document.createElement('p');
            warning.id = 'emailWarning';
            warning.innerHTML = '*Please enter a valid email';
            createEmail.after(warning);    
        }

        validateEmail = false;

    }

    // Validation for username
    const userReq = /^[a-z A-Z 0-9]{5,}$/;
    const username = createUsername.value;

    // If the username matches requirements, remove any warnings and turn border green
    if (username.match(userReq)) {
        createUsername.style.borderColor = 'green';

        userWarning = document.getElementById('userWarning');
        if (userWarning) userWarning.remove();

        validateUsername = true;
    }

    // If the username fails validation, turn border red and display warning
    else {
        createUsername.style.borderColor = 'red';

        let warning = document.createElement('p');
        warning.id = 'userWarning';

        // If the length of the username is less than five characters, notify user
        if (username.length < 5) {
            warning.innerHTML = '*Username must be at least five characters';
        }

        else {
            warning.innerHTML = '*Please enter a valid username';
        }

        // If a warning is already displayed, remove it    
        userWarning = document.getElementById('userWarning');
        if (userWarning) userWarning.remove();
        
        // Insert new error message
        createUsername.after(warning);

        validateUsername = false;
    }

    // Validation for password
    const passReq = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{5,}$/;
    const password = createPw.value;

    //If the password matches requirements, remove any warnings and turn border green
    if (password.match(passReq) && password == pwConf.value) {
        createPw.style.borderColor = 'green';
        pwConf.style.borderColor = 'green';

        pwWarning = document.getElementById('pwWarning');
        if (pwWarning) pwWarning.remove();

        validatePassword = true;
    }

    // If the password fails validation, turn border red and display warning
    else {
        createPw.style.borderColor = 'red';
        pwConf.style.borderColor = 'red';

        let warning = document.createElement('p');
        warning.id = 'pwWarning';

        // If password fields don't match, notify user
        if (password != pwConf.value) {
            warning.innerHTML = '*Both password fields must match';
        }

        // If password is less than eight characters, notify user
        else if (password.length < 8) {
            warning.innerHTML = '*Password must be at least eight characters';
        }

        else {

            // If password does not have a digit, notify user
            if (!password.match(/^(?=.*\d)[a-zA-Z0-9]{7,}$/)) {
                warning.innerHTML = "*Password must contain at least one digit"
            }

            // If password does not have a lowercase letter, notify user
            else if (!password.match(/^(?=.*[a-z])[a-zA-Z0-9]{7,}$/)) {
                warning.innerHTML = "*Password must contain at least one lowercase letter"
            }

            // If password does not have an uppercase letter, notify user
            else if (!password.match(/^(?=.*[A-Z])[a-zA-Z0-9]{7,}$/)) {
                warning.innerHTML = "*Password must contain at least one uppercase letter"
            }
            
        }

        // If a warning is already displayed, remove it
        pwWarning = document.getElementById('pwWarning');
        if (pwWarning) pwWarning.remove();

        // Insert new error message
        pwConf.after(warning);

        validatePassword = false;
    }

    return (validateEmail && validateUsername && validatePassword);
}

// Event listener for sign-up form submission
createAccButton.addEventListener('click', (event) => {
    event.preventDefault();

    // Call function to validate form data
    const result = validateForm();

    if (result) {

        // If input passes validation, create an object called data containing email, username, and password values
        const data = {email: createEmail.value.toString(), username: createUsername.value.toString(), password: createPw.value.toString()};

        // Make a fetch request to the server with method POST and content-type of JSON
        fetch('http://localhost:3000/signup.html', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            // Convert the object data to a string format
            body: JSON.stringify(data)
        }).then(response => {
            // Takes the returned Promise and resolves it to an object
            response.json();

            if (response.redirected) {
                // If the response object is redirected by the server, change the window's location to that of the URL
                window.location.href = response.url;
            }
        
        }).catch(error => {
            // If an error occurs, print it to the console.
            console.log(error);
        });
    }

});

