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
                const query = 'SELECT Group_id, Group_name FROM user_data, group_data, enters WHERE User_id = ? AND Group_id = G_id AND User_id = Member_id';

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

        catch(error) {

            //If error occurred with data retrieval, print to the console
            console.log(error);
        }
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

            // If the user attempts to friend themselves, throw an error
            if (userId == friendId) throw new Error("User cannot friend themselves!");

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

    async getDirectMsg(userVal, friendName) {

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

            // Attempt to retrieve a user id for the given friend name
            const fId = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                const query = 'SELECT User_id FROM user_data WHERE Username = ?';

                // Processes query through database, replacing the ? with the friendName provided
                dbCon.query(query, [friendName], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // Assign the user id retrieved from the database to a constant
            const friendId = fId[0].User_id.toString();

            // Attempt to retrieve message data for a user id
            const directMsg = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                const query = 'SELECT Username, Content, Date_sent FROM user_data, receives, message_data WHERE ((Receiver_id = ? AND Sender_id = ?) OR (Sender_id = ? AND Receiver_id = ?)) AND M_id = Message_id AND Sender_id = User_id AND Group_message = 0 ORDER BY Date_sent';

                // Processes query through database, replacing the ? with the userId and friendId provided
                dbCon.query(query, [userId, friendId, userId, friendId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            return directMsg;

        }

        // If error occurred with data retrieval, print to the console
        catch (error) {
            console.log(error);
        }

    }

    async getGroupMsg(groupName) {

        try {

            // Attempt to retrieve a group id for a given group name
            const gId = await new Promise((resolve, reject) => {
                        
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

            // Assign the group id retrieved from the database to a constant
            const groupId = gId[0].Group_id.toString();

            // Attempt to retrieve group message data for the given groupId
            const groupMsg = await new Promise((resolve, reject) => {
                        
                // Creates query for database connection
                const query = 'SELECT Username, Content, Date_sent FROM user_data, message_data, group_data WHERE Group_message = 1 AND Group_id = ? AND Chat_id = Group_id AND Sender_id = User_id ORDER BY Date_sent';

                // Processes query through database, replacing the ? with the userVal provided
                dbCon.query(query, [groupId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            return groupMsg;

        }

        // If error occurred with data retrieval, print to the console
        catch(error) {
            console.log(error);
        }

    }

    async sendDirectMsg(userVal, friendName, usrMsg, msgDate) {

        try {

            // Attempt to retrieve a user id for a given username
            const uId = await new Promise((resolve, reject) => {
                    
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
            const userId = uId[0].User_id.toString();

            // Attempt to retrieve a user id for the given friend name
            const fId = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                const query = 'SELECT User_id FROM user_data WHERE Username = ?';

                // Processes query through database, replacing the ? with the friendName provided
                dbCon.query(query, [friendName], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // Assign the user id retrieved from the database to a constant
            const friendId = fId[0].User_id.toString();

            // Randomly generate a message id for the new message
            const msgId = Math.floor(Math.random() * 100000000);

            // Attempt to insert a message entry in database
            let mResponse = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                let query = 'INSERT INTO message_data VALUES (?, ?, 0, ?, ?, null)';

                // Processes query through database, replacing the ? with the values provided
                dbCon.query(query, [msgId, usrMsg, msgDate, userId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // Attempt to insert a recipient entry in database
            let rResponse = await new Promise((resolve, reject) => {
                    
                // Creates query for database connection
                let query = 'INSERT INTO receives VALUES (?, ?)';

                // Processes query through database, replacing the ? with the values provided
                dbCon.query(query, [msgId, friendId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // If message is successfully sent, return true
            return true;

        }

        catch(error) {
            // If error occurred with sending message, print it to console and return false
            console.log(error);
            return false;
        }

    }

    async sendGroupMsg(userVal, groupName, usrMsg, msgDate) {

        try {

            // Attempt to retrieve a user id for a given username
            const uId = await new Promise((resolve, reject) => {
                        
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
            const userId = uId[0].User_id.toString();

            // Attempt to retrieve a group id for a given group name
            const gId = await new Promise((resolve, reject) => {
                        
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

            // Assign the group id retrieved from the database to a constant
            const groupId = gId[0].Group_id.toString();

            // Attempt to retrieve a list of user ids for a given group id
            const mList = await new Promise((resolve, reject) => {
                        
                // Creates query for database connection
                const query = 'SELECT Member_id FROM enters WHERE G_id = ?';

                // Processes query through database, replacing the ? with the userVal provided
                dbCon.query(query, [groupId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // Create a new array to store a list of user ids
            const memberList = [mList.length];

            // Loop through the array of database entries and assign the strings to the memberList array
            for (let i = 0; i < mList.length; i++) memberList[i] = mList[i].Member_id.toString();
            
            // Randomly generate a message id for the new message
            const msgId = Math.floor(Math.random() * 100000000);

            // Attempt to insert a message entry in database
            let mResponse = await new Promise((resolve, reject) => {
                        
                // Creates query for database connection
                let query = 'INSERT INTO message_data VALUES (?, ?, 1, ?, ?, ?)';

                // Processes query through database, replacing the ? with the values provided
                dbCon.query(query, [msgId, usrMsg, msgDate, userId, groupId], (error, result) => {
                    if (error) { 
                        reject(new Error(error.message));
                    }
                    else {
                        resolve(result);
                    } 
                });
            });

            // Loop through the list of user ids in the current group and assign each string a database entry
            for (let j = 0; j < memberList.length; j++) {

                // Attempt to insert a recipient entry in database
                let rResponse = await new Promise((resolve, reject) => {
                            
                    // Creates query for database connection
                    let query = 'INSERT INTO receives VALUES (?, ?)';

                    // Processes query through database, replacing the ? with the values provided
                    dbCon.query(query, [msgId, memberList[j]], (error, result) => {
                        if (error) { 
                            reject(new Error(error.message));
                        }
                        else {
                            resolve(result);
                        } 
                    });
                });    

            }

            // If message is successfully sent, return true
            return true;

        }

        catch(error) {
            // If error occurred with sending message, print it to console and return false
            console.log(error);
            return false;
        }

    }

}

// Exports the class DbConnector to be used in app.js
module.exports = DbConnector;