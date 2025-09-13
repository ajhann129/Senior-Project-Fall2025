const createAccButton = document.getElementById('createAccButton');
const createEmail = document.getElementById('createEmail');
const createUsername = document.getElementById('createUsername');
const createPw = document.getElementById('createPw');
const pwConf = document.getElementById('pwConf');

// Event listener for sign-up form submission
createAccButton.addEventListener('click', (event) => {
    event.preventDefault();

    // Validation for email
    const emailReq = /^[a-z A-Z]+@[a-z A-Z]+\.[a-z A-Z]{2,}$/;
    const email = createEmail.value.toString();

    //If the email matches requirements, remove any warnings and turn border green
    if (email.match(emailReq)) {
        createEmail.style.borderColor = 'green';

        emailWarning = document.getElementById('emailWarning');
        if (emailWarning) emailWarning.remove();
    }

    else {
        
        //If the email fails validation, turn border red and display warning
        if (createEmail.style.borderColor != 'red') {
            createEmail.style.borderColor = 'red';

            let warning = document.createElement('p');
            warning.id = 'emailWarning';
            warning.innerHTML = '*Please enter a valid email';
            createEmail.after(warning);    
        }

    }

    // Validation for username
    const userReq = /^[a-z A-Z 0-9]{5,}$/;
    const username = createUsername.value;

    //If the username matches requirements, remove any warnings and turn border green
    if (username.match(userReq)) {
        createUsername.style.borderColor = 'green';

        userWarning = document.getElementById('userWarning');
        if (userWarning) userWarning.remove();
    }

    else {

        //If the username fails validation, turn border red and display warning
        if (createUsername.style.borderColor != 'red') {
            createUsername.style.borderColor = 'red';

            let warning = document.createElement('p');
            warning.id = 'userWarning';

            if (username.length < 5) {
                warning.innerHTML = 'Username must be at least five characters';
            }

            else {
                warning.innerHTML = '*Please enter a valid username';
            }
            
            
            createUsername.after(warning);
        }

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
    }

    else {

        //If the password fails validation, turn border red and display warning
        if (createPw.style.borderColor != 'red' && pwConf.style.borderColor != 'red') {
            createPw.style.borderColor = 'red';
            pwConf.style.borderColor = 'red';

            let warning = document.createElement('p');

            if (password != pwConf.value) {
                warning.innerHTML = '*Both password fields must match';
            }

            else if (password.length < 8) {
                warning.innerHTML = '*Password must be at least 8 characters';
            }

            else {

                if (!password.match(/^(?=.*\d)[a-zA-Z0-9]{7,}$/)) {
                    warning.innerHTML = "*Password must contain at least one digit"
                }

                else if (!password.match(/^(?=.*[a-z])[a-zA-Z0-9]{7,}$/)) {
                    warning.innerHTML = "*Password must contain at least one lowercase letter"
                }

                else if (!password.match(/^(?=.*[A-Z])[a-zA-Z0-9]{7,}$/)) {
                    warning.innerHTML = "*Password must contain at least one uppercase letter"
                }
            
            }

            warning.id = 'pwWarning';
            pwConf.after(warning);
        }
        
    }
})