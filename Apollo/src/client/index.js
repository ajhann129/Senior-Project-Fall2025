const loginButton = document.getElementById('loginButton');
const username = document.getElementById('username');
const password = document.getElementById('password');

// Event listener for sign-in form submission
loginButton.addEventListener('click', (event) => {
    event.preventDefault();

    //Set username and password values to those contained within the input elements
    const userVal = username.value;
    const pwVal = password.value;

    // Create an object called data containing userVal and pwVal
    const data = {userVal, pwVal};

    // Make a fetch request to the server with method POST and content-type of JSON
    fetch('http://localhost:3000/', {
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

        else if (username.style.borderColor != 'red' && password.style.borderColor != 'red') {
            // Otherwise, if there was no redirect, display a warning to the user
            username.style.borderColor = 'red';
            password.style.borderColor = 'red';

            let warning = document.createElement('p');
            warning.id = 'emailWarning';
            warning.innerHTML = '*Username or password incorrect';
            password.after(warning);  
        }

    }).catch(error => {
        console.log(error);
    });

})