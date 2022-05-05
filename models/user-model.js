const mysql = require('mysql2/promise');
const validateUtils = require('../validateUtils');

var connection;

/**
 * Initializes Database and creates User table with ID, Name and Release Artist as fields if the table does not already exist
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
        const sqlQuery = 'CREATE TABLE IF NOT EXISTS user(id int AUTO_INCREMENT, email VARCHAR(50), password VARCHAR(50), PRIMARY KEY (id))';
        await connection.execute(sqlQuery);
    }
    catch(error){
        console.error(error);
    } 
}


/**
 * Creates a new user based on its email and release password.
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
 * Creates a new user based on its email and release password.
* @param {string} email
* @param {number} password
* @returns {Object} An user Object
*/
async function create(email, password){
    // Validate Input
    if(!validateUtils.isValid(email, password)){
        throw new InvalidInputError(`Invalid input when trying to create ${email} released in ${password}. `);
    }

    // check if user already exists
    const users = await findByName(email);
    if(users.length > 0){
        throw new InvalidInputError(`${email} already exists. `);
    }

    try{
        // Execute Sql command to database
        const sqlQuery = `INSERT INTO user (email, password) VALUES (?, ?)`;
        await connection.execute(sqlQuery, [email, password]);

        // return created user
        const user = {"email": email, "password": password}
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
        const [users, fields] = await connection.execute(sqlQuery, [email]);

        return users[0];
    }
    catch(error){
        console.error(error.message);
        return null;
    }

}

/**
 * Finds an user based on its email
* @param {string} email
* @returns {Array} An array of user objects
*/
async function findByName(email){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM user WHERE email = ?`;
        const [users, fields] = await connection.execute(sqlQuery, [email]);

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
 * Updates an user with a new email and password.
* @param {string} currentName
* @param {string} newName
* @param {number} newArtist
* @returns {boolean} whether update was successful
*/
async function update(currentName, newName, newArtist){
    // Validate Input for both current and new email, and make sure element exists
    if(!validateUtils.isValid(newName, newArtist)){
        throw new InvalidInputError(`Invalid input when trying to update fields to ${newName} and ${newArtist}`);
    }

    try {
        if(await findByName(currentName) == null){
            console.error(`No such user with email ${currentName}`);
            return false;
        }
    } 
    catch (error) {
        throw error;
    }



    try{
        // Execute Sql command to database
        const sqlQuery = `UPDATE user SET email = ?, password = ? WHERE email = ?`;
        await connection.execute(sqlQuery, [newName, newArtist, currentName]);

        return true;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Deletes any user containing the specified email and password
* @param {string} email
* @param {number} password
* @returns {boolean} if db is now removed of that user
*/
async function remove(id){

    // if user doesn't exist
    if(findByName(email).length < 1){
        return false;
    }

    try{
        // Execute Sql command to database
        const sqlQuery = `DELETE FROM user WHERE email = ? AND password = ?`;
        await connection.execute(sqlQuery, [email, password]);

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
    findByName,
    findAll,
    update,
    remove,
    getConnection,
    endConnection,
    InvalidFileError,
    InvalidInputError,
    DatabaseExecutionError
}