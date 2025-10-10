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

    async createGroup(userVal, groupName) {

        try {

            // Attempt to retrieve a user id for the given name
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

            // Generate a random id number for the provided group name
            const groupId = Math.floor(Math.random() * 1000000);

            // Assign the retrieved user id to a constant
            const userId = id[0].User_id.toString();

            // Attempt to insert a new group into database
            const gResponse = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                const query = 'INSERT INTO group_data VALUES (?, ?, ?)';

                // Processes query through database, replacing the ? with the values provided
                dbCon.query(query, [groupId, groupName, userId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // Attempt to add creator as a member of group
            const hResponse = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                let query = 'INSERT INTO enters VALUES (?, ?)';

                // Processes query through database, replacing the ? with the values provided
                dbCon.query(query, [groupId, userId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // If group is successfully created, return true
            return true;

        }

        
        catch(error) {
            
            // If an error occurred in group creation, print it to console and return false
            console.log(error);
            return false;
        }

    }

    async addMembers(groupName, members) {

        try {
            // Create a new array to store corresponding ids
            const memberId = [members.length];

            // Loop through database to retrieve associated id with each username
            for (let i = 0; i < members.length; i++) {
                let mId = await new Promise((resolve, reject) => {

                    // Creates query for database connection
                    let query = 'SELECT User_id FROM user_data WHERE username = ?';

                    // Processes query through database, entering data from the current array index
                    dbCon.query(query, [members[i]], (error, result) => {
                        if (error) {
                            reject(new Error(error.message));
                        }
                        else {
                            resolve(result);
                        }
                    });
                });

                // Assign data retrieved to index i of the memberId array
                memberId[i] = mId[0].User_id.toString();
            }

            // Attempt to retrieve a corresponding id for the provided groupName
            const groupId = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT Group_id FROM group_data WHERE Group_name = ?';

                // Processes query through database, replacing the ? with the groupName provided
                dbCon.query(query, [groupName], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // Assign the retrieved group id to a constant
            const gId = groupId[0].Group_id.toString();
            
            // Loop through the database a second time to assign members to the group
            for (let i = 0; i < memberId.length; i++) {

                let response = await new Promise((resolve, reject) => {
                    
                    // Creates query for database connection
                    let query = 'INSERT INTO enters VALUES (?, ?)';

                    // Processes query through database, replacing the ? with the values provided
                    dbCon.query(query, [gId, memberId[i]], (error, result) => {
                        if (error) { 
                            reject(new Error(error.message));
                        }
                        else {
                            resolve(result);
                        } 
                    });
                });

            }

            // If members are successfully added, return true.
            return true;

        }

        catch(error) {

            // If an error occurred in adding members, print it to console and return false
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

            // If error occurred with data retrieval, print to the console
            console.log(error);
        }
    }

    async getGroups(userVal) {
        try {
            
            // Attempt to retrieve a user id for a given username
            const id = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT User_id FROM user_data WHERE Username = ?';

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

            // If error occurred with data retrieval, print to the console
            console.log(error);
        }
    }

    async getFriendReqs(userVal) {
        // Attempt to retrieve a user id for a given username
        const id = await new Promise((resolve, reject) => {
                
            // Creates query for database connection
            const query = 'SELECT User_id FROM user_data WHERE Username = ?';

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
        const reqList = await new Promise((resolve, reject) => {
                
            // Creates query for database connection
            const query = 'SELECT User_id, Username FROM user_data WHERE User_id in (SELECT Requester_id FROM user_data, requests WHERE User_id = ? AND User_id = Recipient_id)';

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

        return reqList;
    }

    async friendReq(userVal, friendId) {
        try {

            // Attempt to retrieve a user id for a given username
            const id = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT User_id FROM user_data WHERE Username = ?';

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

            // Attempt to insert a friend request entry in database
            let response = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                let query = 'INSERT INTO requests VALUES (?, ?)';

                // Processes query through database, replacing the ? with the values provided
                dbCon.query(query, [userId, friendId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // If friend request succeeded, return true
            return true;

        }

        catch (error){

            // If error occurred with friend request, print it to console and return false
            console.log(error);
            return false;
        }
    }

    async acceptFriend(userVal, friendId) {

        try {

            // Attempt to retrieve a user id for a given username
            const id = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT User_id FROM user_data WHERE Username = ?';

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

            /* NOTE: Friend insertion query must be performed twice because of the nature of a 
               friend relationship; Ex. user1 is friends with user2 and user2 is friends with user1, 
               thus a friend relationship is two-way */

            const fResponse1 = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                let query = 'INSERT INTO friends VALUES (?, ?)';

                // Processes query through database, replacing the ? with the values provided
                dbCon.query(query, [userId, friendId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });

            });

            const fResponse2 = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                let query = 'INSERT INTO friends VALUES (?, ?)';

                // Processes query through database twice, replacing the ? with the values provided
                dbCon.query(query, [friendId, userId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });

            });


            // Delete friend request entry from database
            const rResponse = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                let query = 'DELETE FROM requests WHERE Requester_id = ? AND Recipient_id = ?';

                // Processes query through database, replacing the ? with the values provided
                dbCon.query(query, [friendId, userId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });

            });

            // If friend relationship is established successfully and request entry is deleted, return true
            return true;

        }

        // If error occurred with friend relationship, print it to console and return false
        catch(error) {
            console.log(error);
            return false;
        }
 
    }

    async rejectFriend(userVal, friendId) {

        try {

            // Attempt to retrieve a user id for a given username
            const id = await new Promise((resolve, reject) => {
                
                // Creates query for database connection
                const query = 'SELECT User_id FROM user_data WHERE Username = ?';

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

            // Delete friend request entry from database
            const rResponse = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                let query = 'DELETE FROM requests WHERE Requester_id = ? AND Recipient_id = ?';

                // Processes query through database twice, replacing the ? with the values provided
                dbCon.query(query, [friendId, userId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });

            });

            // If friend request is deleted successfully, return true
            return true;

        }

        // If error occurred with request deletion, print it to console and return false
        catch(error) {
            console.log(error);
            return false;
        }

    }
}

// Exports the class DbConnector to be used in app.js
module.exports = DbConnector;