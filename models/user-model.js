const mysql = require('mysql2/promise');
const validateUtils = require('../validateUtils');

var connection;

/**
 * Initializes Database and creates User table with ID, Username and Password as fields if the table does not already exist
 * 
*/
async function initialize(dbName, reset) {
    connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        port: '10000',
        password: 'pass',
        database: dbName
    });


    if (reset){
        const dropQuery = "DROP TABLE IF EXISTS user";
        try{
            await connection.execute(dropQuery);
        }
        catch(error){
            console.error(error.message);
        }
    }

    try{
        const sqlQuery = 'CREATE TABLE IF NOT EXISTS user(id int AUTO_INCREMENT, username VARCHAR(50), password VARCHAR(255), PRIMARY KEY (id))';
        await connection.execute(sqlQuery);
    }
    catch(error){
        console.error(error);
    } 
}


/**
 * Creates a new user based on its username and release password.
* @param {string} tableName
* @returns {boolean} success of truncate
*/
async function truncate(tableName){
    try{
        const sqlQuery = `TRUNCATE TABLE ${tableName}`;
        await connection.execute(sqlQuery);
        return true;
    }
    catch(error){
        console.error(error);
        return false;
    }
}

/**
 * Creates a new user based on its username and release password.
* @param {string} username
* @param {number} password
* @returns {Object} An user Object
*/
async function create(username, password){
    // Validate Input
    if(!validateUtils.isValid(username, password)){
        throw new InvalidInputError(`Invalid input when trying to create ${username} released in ${password}. `);
    }


    try{
        // Execute Sql command to database
        const sqlQuery = `INSERT INTO user (username, password) VALUES (?, ?)`;
        await connection.execute(sqlQuery, [username, password]);

        // return created user
        const user = {"username": username, "password": password}
        return user;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Finds an user based on id
* @param {number} id
* @returns {Object} An user object
*/
async function findById(id){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM user WHERE id = ?`;
        const [users, fields] = await connection.execute(sqlQuery, [username]);

        return users[0];
    }
    catch(error){
        console.error(error.message);
        return null;
    }

}

/**
 * Finds an user based on its username
* @param {string} username
* @returns {Array} An array of user objects
*/
async function findByUsername(username){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM user WHERE username = ?`;
        const [users, fields] = await connection.execute(sqlQuery, [username]);

        return users;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Finds all users in the table
* @returns {Array} An array of user objects
*/
async function findAll(){

    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM user`;
        const [users, fields] = await connection.execute(sqlQuery);

        return users;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Updates an user with a new username and password.
* @param {string} currentUsername
* @param {string} newUsername
* @param {number} newPassword
* @returns {boolean} whether update was successful
*/
async function update(currentUsername, newUsername, newPassword){
    // Validate Input for both current and new username, and make sure element exists
    if(!validateUtils.isValid(newUsername, newPassword)){
        throw new InvalidInputError(`Invalid input when trying to update fields to ${newUsername} and ${newPassword}`);
    }

    try {
        if(await findByUsername(currentUsername) == null){
            console.error(`No such user with username ${currentUsername}`);
            return false;
        }
    } 
    catch (error) {
        throw error;
    }



    try{
        // Execute Sql command to database
        const sqlQuery = `UPDATE user SET username = ?, password = ? WHERE username = ?`;
        await connection.execute(sqlQuery, [newUsername, newPassword, currentUsername]);

        return true;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Deletes any user containing the specified username and password
* @param {string} username
* @param {number} password
* @returns {boolean} if db is now removed of that user
*/
async function remove(id){

    // if user doesn't exist
    if(findByUsername(username).length < 1){
        return false;
    }

    try{
        // Execute Sql command to database
        const sqlQuery = `DELETE FROM user WHERE username = ? AND password = ?`;
        await connection.execute(sqlQuery, [username, password]);

        return true;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}


function getConnection(){
    return connection;
}

function endConnection(){
    if(connection){
        connection.end();
    }
}

class InvalidInputError extends Error {
    
}

class InvalidFileError extends Error {

}

class DatabaseExecutionError extends Error {

}

module.exports = {
    initialize,
    truncate,
    create,
    findByUsername,
    findAll,
    update,
    remove,
    getConnection,
    endConnection,
    InvalidFileError,
    InvalidInputError,
    DatabaseExecutionError
}