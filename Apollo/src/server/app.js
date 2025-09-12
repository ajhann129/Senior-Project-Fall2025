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
                res.redirect('/ui.html');
            }
            // If the password given does not match the hash, send an error message to the server
            else {
                console.log(`Access denied to ${userVal}!`);
                res.json();
            }
        })
    }

    catch(error) {
        console.log(error.message);
    }
});

/*app.get('/example',(req, res) => {
    res.send('<h1>Hello there.</h1> <link rel=\"stylesheet\" href=\"styles.css\">');
})*/ 

app.listen(process.env.PORT, () => console.log('Server connected...'));