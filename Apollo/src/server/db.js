const mysql = require('mysql2');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Initialize class instance with null
let instance = null;

dotenv.config();

// Create a database connection with the mysql2 module with the env file's contents, assigning the object to dbCon
const dbCon = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

dbCon.connect((error) => {
    if (error) {
        console.log(error.message);
    }

    else {
        console.log('Connected to database...');
    }
}) 

class DbConnector {

    // Constructor for DbConnector class
    // If an instance does not exist, it creates one; otherwise it returns the current instance
    static DbConnector() {
        return instance ? instance : new DbConnector(); 
    }

    // Method to verify login
    async login(userVal, pwVal) {
        
        // Attempt to verify login
        try {
            // Creates a new Promise object and assigns it to response 
            const response = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT Password, Salt FROM user_data WHERE username = ?';

                // Processes query through database, replacing the ? with the userVal provided
                dbCon.query(query, [userVal], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });
        

            // Retrieves the salt and password values from the database
            const salt = response[0].Salt;
            const password = response[0].Password;

            // Creates a hash with the entered password and salt from the database
            const hash = crypto.scryptSync(pwVal, salt, 64).toString('hex');

            // If the hash matches the value stored, return true; otherwise return false
            if (hash === password) return true;
            return false;
        }

        catch(error) {

            // If an account cannot be verified, print error to console and return false 
            console.log(error.message);
            return false;
        }

    }

    // Method to create account
    async createAcc(emailVal, userVal, pwVal) {

        // Attempt to insert a new user into database
        try {

            // Randomly generate a userId and salt
            const userId = Math.floor(Math.random() * 1000000);
            const salt = crypto.randomBytes(16).toString('hex');

            // Create a hash with the generated salt and provided password
            const password = crypto.scryptSync(pwVal, salt, 64).toString('hex');

            const response = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'INSERT INTO user_data VALUES (?, ?, ?, ?, ?)';

                // Processes query through database, replacing the ? with the values provided
                dbCon.query(query, [userId, emailVal, userVal, password, salt], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // If account is successfully created, return true
            return true;
        }

        catch(error) {
            
            // If an error occurs in account creation, print error to console and return false
            console.log(error);
            return false;
        }

    }

    async getFriends(userVal) {

        try {
            
            // Attempt to retrieve a user id for a given username
            const id = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT User_id FROM user_data WHERE username = ?';

                // Processes query through database, replacing the ? with the userVal provided
                dbCon.query(query, [userVal], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // Assign the user id retrieved from the database to a constant
            const userId = id[0].User_id.toString();

            // Attempt to retrieve friend data for a user id
            const friendList = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT User_id, Username FROM user_data, friends WHERE F_id = ? AND User_id = U_id AND User_id != ?';

                // Processes query through database, replacing the ? with the userVal provided
                dbCon.query(query, [userId, userId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            return friendList;
        }
        
        catch(error) {
            console.log(error);
        }
    }

    async getGroups(userVal) {
        try {
            
            // Attempt to retrieve a user id for a given username
            const id = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT User_id FROM user_data WHERE username = ?';

                // Processes query through database, replacing the ? with the userVal provided
                dbCon.query(query, [userVal], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // Assign the user id retrieved from the database to a constant
            const userId = id[0].User_id.toString();

            // Attempt to retrieve group data for a user id
            const groupList = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT Group_id, Group_name FROM user_data, group_data WHERE User_id = ? AND User_id = Creator_id';

                // Processes query through database, replacing the ? with the userVal provided
                dbCon.query(query, [userId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            return groupList;
        }
        
        catch(error) {
            console.log(error);
        }
    }
}

// Exports the class DbConnector to be used in app.js
module.exports = DbConnector;