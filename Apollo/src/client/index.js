const loginButton = document.getElementById('loginButton');
const username = document.getElementById('username');
const password = document.getElementById('password');

// Event listener for sign-in form submission
loginButton.addEventListener('click', (event) => {
    event.preventDefault();
    console.log("Username: " + username.value + " Password: " + password.value);
})