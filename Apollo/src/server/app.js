const express = require('express');
const app = express();
//const crypto = require('crypto');
const cors = require('cors');
const dotenv = require('dotenv');
const DbConnector = require('./db');

//Loads contents of env file into process.env
dotenv.config();

//Specifies cors as request handler
app.use(cors());
// Allows server to display static HTML
app.use(express.static('../client/static'));
// Allows server to read data in a JSON format
app.use(express.json());
// Allows server to read form data
app.use(express.urlencoded({extended: false}));

app.set('views', '../client/views');
app.set('view engine', 'ejs');

users = [];

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
                //users.push({user: userVal});
                res.status(200);
                res.redirect(`/ui?userVal=${userVal}`);
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
                //users.push({user: userVal});
                res.status(200);
                res.redirect(`/ui?userVal=${username}`);
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

app.get('/ui', (req, res) => {

    // Attempt to retrieve friend and group data for user page
    try {

        // Retrieve userVal from the query string and assign it to a constant
        const userVal = req.query.userVal;
        const db = new DbConnector();
        
        // Retrieve friend data from database
        fResult = db.getFriends(userVal);
        fResult.then((fList) => {

            // Retrieve group data from database
            gResult = db.getGroups(userVal);
            gResult.then((gList) => {

                // Render the ui page with the retrieved data (if any)
                res.status(200);
                res.render('ui.ejs', {
                    userVal: userVal,
                    fList: fList,
                    gList: gList
                });

            });
            
        });
    }

    // If an error occurs, print it to the console
    catch (error) {
        console.log(error.message);
    }

});

app.get('/chat', (req, res) => {

    res.render('chat.ejs');

})

app.listen(process.env.PORT, () => console.log('Server connected...'));