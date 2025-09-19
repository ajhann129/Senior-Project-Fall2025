const express = require('express');
const app = express();
const crypto = require('crypto');
const cors = require('cors');
const dotenv = require('dotenv');
const DbConnector = require('./db');

//Loads contents of env file into process.env
dotenv.config();

//Specifies cors as request handler
app.use(cors());
// Allows server to display static HTML
app.use(express.static('../client'));
// Allows server to read data in a JSON format
app.use(express.json());
// Allows server to read form data
app.use(express.urlencoded({extended: false}));

// Response to user login
app.post('/', (req, res) => {
    try {
        const db = new DbConnector();

        // Assign userVal and pwVal with the values sent by the form
        const {userVal, pwVal} = req.body;

        // Attempt to verify the credentials provided
        approve = db.login(userVal, pwVal);
        approve.then(result => {
            // If the password given matches the hash stored in the database, redirect to the ui page
            if (result == true) {
                console.log(`${userVal} has signed in!`);
                res.status(200);
                res.redirect('/ui.html');
            }
            // If the password given does not match the hash, send an error message to both the user and server
            else {
                console.log(`Access denied to ${userVal}!`);
                res.status(401);
                res.send({success: false});
            }
        });
    }

    // If an error occurs, print it to the console
    catch(error) {
        console.log(error.message);
    }
});

// Response to account creation
app.post('/signup.html', (req, res) => {
    
    try {

        // Assign email, username, and password with the values sent by the form
        const {email, username, password} = req.body;
        const db = new DbConnector();

        // Attempt to create an account with the given credentials
        const success = db.createAcc(email, username, password);

        success.then(result => {
            
            // If the account is successfully created, redirect to the ui page 
            if (result == true) {
                console.log('Account successfully created!');
                res.status(200);
                res.redirect('/ui.html');
            }
            
            // If account creation fails, send an error message to both the user and server 
            else {
                console.log('Account creation failed!');
                res.status(500);
                res.send({success: false});
            }

        });
    }

    // If an error occurs, print it to the console
    catch (error){
        console.log(error.message);
    }
    

});

app.listen(process.env.PORT, () => console.log('Server connected...'));