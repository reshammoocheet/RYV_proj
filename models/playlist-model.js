const mysql = require('mysql2/promise');
const validateUtils = require('../validateUtils');

var connection;

/**
 * Initializes Database and creates Playlist table with ID, Name and Release Description as fields if the table does not already exist
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
        const dropQuery = "DROP TABLE IF EXISTS playlist";
        try{
            await connection.execute(dropQuery);
        }
        catch(error){
            console.error(error.message);
        }
    }

    try{
        const sqlQuery = 'CREATE TABLE IF NOT EXISTS playlist(id int AUTO_INCREMENT, name VARCHAR(50), description VARCHAR(512), user_id int, PRIMARY KEY (id))';
        await connection.execute(sqlQuery);
    }
    catch(error){
        console.error(error);
    }
}


/**
 * Creates a new playlist based on its name and release description.
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
 * Creates a new playlist based on its name and release description.
* @param {string} name
* @param {number} description
* @returns {Object} An playlist Object
*/
async function create(name, user_id, description = ""){
    // Validate Input
    if(!name){
        throw new InvalidInputError(`Invalid input when trying to create playlist. Make sure you entered a valid name. `);
    }

    

    try{
        // Execute Sql command to database
        const sqlQuery = `INSERT INTO playlist (name, description, user_id) VALUES (?, ?, ?)`;
        await connection.execute(sqlQuery, [name, description, user_id]);

        // return created playlist
        const playlist = {"name": name, "description": description, "user_id": user_id}
        return playlist;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Finds an playlist based on id
* @param {number} id
* @returns {Object} An playlist object
*/
async function findById(id){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM playlist WHERE id = ?`;
        const [playlists, fields] = await connection.execute(sqlQuery, [id]);

        return playlists[0];
    }
    catch(error){
        console.error(error.message);
        return null;
    }

}

/**
 * Finds an playlist based on its name
* @param {string} name
* @returns {Array} An array of playlist objects
*/
async function findByName(name){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM playlist WHERE name = ?`;
        const [playlists, fields] = await connection.execute(sqlQuery, [name]);

        return playlists;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Finds an playlist based on its user
* @param {int} id
* @returns {Array} An array of playlist objects
*/
async function findByUserId(id){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM playlist WHERE user_id = ?`;
        const [playlists, fields] = await connection.execute(sqlQuery, [id]);

        return playlists;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Finds all playlists in the table
* @returns {Array} An array of playlist objects
*/
async function findAll(){

    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM playlist`;
        const [playlists, fields] = await connection.execute(sqlQuery);

        return playlists;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Updates an playlist with a new name and description.
* @param {string} currentName
* @param {string} newName
* @param {number} newDescription
* @returns {boolean} whether update was successful
*/
async function update(currentName, newName, newDescription){

    // Validate Input
    if(!newName){
        throw new InvalidInputError(`Invalid input when trying to update fields to ${newName} and ${newDescription} press My Library to try again. `);
    }

    try {
        if(await findByName(currentName) == null){
            console.error(`No such playlist with name ${currentName}`);
            return false;
        }
    } 
    catch (error) {
        throw error;
    }



    try{
        // Execute Sql command to database
        const sqlQuery = `UPDATE playlist SET name = ?, description = ? WHERE name = ?`;
        await connection.execute(sqlQuery, [newName, newDescription, currentName]);

        return true;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Deletes any playlist containing the specified name and description
* @param {Number} id
* @returns {boolean} if db is now removed of that playlist
*/
async function remove(id){


    try{
        // Execute Sql command to database
        const sqlQuery = `DELETE FROM playlist WHERE id = ?`;
        await connection.execute(sqlQuery, [id]);

        // Execute Sql command to database
        const sqlQuery2 = `DELETE FROM playlist_song WHERE playlist_id = ?`;
        await connection.execute(sqlQuery2, [id]);
        

        return true;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Gets the connection to the database
 * @returns {object} the connection to the database
 */
function getConnection(){
    return connection;
}
/**
 * Ends the connection to the database
 */
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
    findById,
    findAll,
    findByUserId,
    update,
    remove,
    getConnection,
    endConnection,
    InvalidFileError,
    InvalidInputError,
    DatabaseExecutionError
}