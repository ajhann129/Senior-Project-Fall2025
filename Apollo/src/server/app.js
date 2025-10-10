const express = require('express');
const app = express();
//const crypto = require('crypto');
const cors = require('cors');
const dotenv = require('dotenv');
const DbConnector = require('./db');

// Loads contents of env file into process.env
dotenv.config();

// Specifies cors as request handler
app.use(cors());
// Allows server to display static HTML
app.use(express.static('../client/static'));
// Allows server to read data in a JSON format
app.use(express.json());
// Allows server to read form data
app.use(express.urlencoded({extended: false}));

app.set('views', '../client/views');
app.set('view engine', 'ejs');

// Array to store user information
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
                users.push({user: userVal});
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
                users.push({user: userVal});
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

// Displays user page
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

                // Retrieve request data from database
                rResult = db.getFriendReqs(userVal); 
                rResult.then((rList) => {

                    // Render the ui page with the retrieved data (if any)
                    res.status(200);
                    res.render('ui.ejs', {
                        userVal: userVal,
                        fList: fList,
                        gList: gList,
                        rList: rList
                    });

                });

            });
            
        });
    }

    // If an error occurs, print it to the console
    catch (error) {
        console.log(error.message);
    }

});

// Response to group creation and/or friend request
app.post('/ui', (req, res) => {

    try {

        // If the request is to create a group, call related functions
        if (req.body.userVal && req.body.group && req.body.members) {

            // Assign values sent in the request body to associated variables
            const {userVal, group, members} = req.body;
            const db = new DbConnector();

            // Create a group for the associated user with the provided name
            const gSuccess = db.createGroup(userVal, group);

            gSuccess.then((gResult) => {

                // If the group was successfully created, add provided members
                if (gResult == true) {
                    console.log('Group successfully created!');

                    const mSuccess = db.addMembers(group, members);

                    mSuccess.then((mResult) => {

                        // If members were successfully added, confirm success with a status of 200
                        if (mResult == true) {
                            console.log('Members successfully added!');
                            res.status(200);
                            res.send({success: true});  
                        }

                        // If members could not be added, return a status of 500 (server-side error)
                        else {
                            console.log('One or more members could not be added.');
                            res.status(500);
                            res.send({success: false});
                        }

                    });

                }

                // If group creation fails, return a status of 500 (server-side error)
                else {
                    console.log('Group creation failed!');
                    res.status(500);
                    res.send({success: false});
                }

            });

        }

        // If the request is to add a friend, call related functions
        else if (req.body.friendId) {
            
            // Assign values sent in the request body to associated variables
            const {userVal, friendId} = req.body;
            const db = new DbConnector();

            // Send a friend request from the current user to the receiving user
            const success = db.friendReq(userVal, friendId);

            success.then((result) => {

                    // If request was successfully sent, confirm success with a status of 200
                    if (result == true) {
                        console.log('Friend request sent!');
                        res.status(200);
                        res.send({success: true});  
                    }

                    // If friend request fails, return a status of 500 (server-side error)
                    else {
                        console.log('An error has occurred.');
                        res.status(500);
                        res.send({success: false});
                    }

            });

        }

        // Otherwise, if the request does not match a recognized form, return a status of 400 (bad request)
        else {
            res.status(400);
            throw new Error('Request not recognized');
        }

    }

    // If an error occurs, print it to the console
    catch(error) {
        console.log(error.message);
    }

});

app.patch('/ui', (req, res) => {

    try {

        // Assign values sent in the request body to associated variables
        const {userVal, friendId, status} = req.body;
        const db = new DbConnector();

        // If associated friend request is accepted, call acceptFriend() function
        if (status == 'accepted') {

            const success = db.acceptFriend(userVal, friendId);

            success.then((result) => {

                    // If request was successfully sent, confirm success with a status of 200
                    if (result == true) {
                        console.log('Friend request accepted!');
                        res.status(200);
                        res.send({success: true});  
                    }

                    // If friend request fails, return a status of 500 (server-side error)
                    else {
                        console.log('An error has occurred.');
                        res.status(500);
                        res.send({success: false});
                    }

            });

        }

        // If associated friend request is rejected, call rejectFriend() function
        else if (status == 'rejected') {

            const success = db.rejectFriend(userVal, friendId);

            success.then((result) => {

                    // If request was successfully sent, confirm success with a status of 200
                    if (result == true) {
                        console.log('Friend request rejected!');
                        res.status(200);
                        res.send({success: true});  
                    }

                    // If friend request fails, return a status of 500 (server-side error)
                    else {
                        console.log('An error has occurred.');
                        res.status(500);
                        res.send({success: false});
                    }

            });
            
        }

        else {
            res.status(400);
            throw new Error('Request not recognized');
        }

    }

    catch(error) {
        console.log(error.message);
    }

});

app.get('/chat', (req, res) => {

    res.status(200);
    console.log(users);
    res.render('chat.ejs');

});

app.listen(process.env.PORT, () => console.log('Server connected...'));