const createAccButton = document.getElementById('createAccButton');
const createEmail = document.getElementById('createEmail');
const createUsername = document.getElementById('createUsername');
const createPw = document.getElementById('createPw');
const pwConf = document.getElementById('pwConf');

// Event listener for sign-up form submission
createAccButton.addEventListener('click', (event) => {
    event.preventDefault();

    // Validation for email
    const emailReq = /[a-z A-Z]+@[a-z A-Z]+\.[a-z A-Z]{2,}$/;
    const email = createEmail.value.toString();

    if (email.match(emailReq)) {
        console.log('email accepted');
    }

    else {
        console.log('an error has occurred');
    }

    // Validation for username
    const userReq = /[a-z A-Z 0-9]{5,}$/;
    const username = createUsername.value;

    if (username.match(userReq)) {
        console.log('username accepted');
    }

    else {
        console.log('an error has occurred');
    }

    // Validation for password
    const passReq = /[a-z A-Z 0-9]{8,}$/;
    const password = createPw.value;

    if (password.match(passReq) && password == pwConf.value) {
        console.log('password accepted');
    }

    else {
        console.log('an error has occurred');
    }
})