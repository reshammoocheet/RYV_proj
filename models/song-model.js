const mysql = require('mysql2/promise');
const validateUtils = require('../validateUtils');

var connection;

/**
 * Initializes Database and creates Song table with ID, Name and Artist as fields if the table does not already exist
 * 
*/
async function initialize(dbName, reset) {
    connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        port: '10003',
        password: 'pass',
        database: dbName
    });


    if (reset){
        const dropQuery = "DROP TABLE IF EXISTS song";
        try{
            await connection.execute(dropQuery);
        }
        catch(error){
            console.error(error.message);
        }
    }

    try{
        const sqlQuery = 'CREATE TABLE IF NOT EXISTS song(id int AUTO_INCREMENT, name VARCHAR(50), artist VARCHAR(50), times_played int, PRIMARY KEY (id))';
        await connection.execute(sqlQuery);
    }
    catch(error){
        console.error(error);
    } 
}


/**
 * Creates a new song based on its name and release artist.
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
 * Creates a new song based on its name and release artist.
* @param {string} name
* @param {number} artist
* @returns {Object} An song Object
*/
async function create(name, artist){
    // Validate Input
    if(!validateUtils.isValid(name, artist)){
        throw new InvalidInputError(`Invalid input when trying to create ${name} released in ${artist}. `);
    }

    // check if song already exists
    const songs = await findByName(name);
    if(songs.length > 0){
        throw new InvalidInputError(`${name} already exists. `);
    }

    try{
        // Execute Sql command to database
        let times = 0;
        const sqlQuery = `INSERT INTO song (name, artist, times_played) VALUES (?, ?, ${times})`;
        await connection.execute(sqlQuery, [name, artist]);

        // return created song
        const song = {"name": name, "artist": artist}
        return song;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Finds an song based on id
* @param {number} id
* @returns {Object} An song object
*/
async function findById(id){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM song WHERE id = ?`;
        const [songs, fields] = await connection.execute(sqlQuery, [id]);

        return songs[0];
    }
    catch(error){
        console.error(error.message);
        return null;
    }

}

async function findTop() {
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM song ORDER BY times_played DESC`;
        const [songs, fields] = await connection.execute(sqlQuery);

        return songs;
    }
    catch(error){
        console.error(error.message);
        return null;
    }
}

/**
 * Finds an song based on its name
* @param {string} name
* @returns {Array} An array of song objects
*/
async function findByName(name){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM song WHERE name = ?`;
        const [songs, fields] = await connection.execute(sqlQuery, [name]);

        return songs;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Finds all songs in the table
* @returns {Array} An array of song objects
*/
async function findAll(){

    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM song`;
        const [songs, fields] = await connection.execute(sqlQuery);

        return songs;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Updates an song with a new name and artist.
* @param {string} currentName
* @param {string} newName
* @param {number} newArtist
* @returns {boolean} whether update was successful
*/
async function update(currentName, newName, newArtist){
    // Validate Input for both current and new name, and make sure element exists
    if(!validateUtils.isValid(newName, newArtist)){
        throw new InvalidInputError(`Invalid input when trying to update fields to ${newName} and ${newArtist}`);
    }

    try {
        if(await findByName(currentName) == null){
            console.error(`No such song with name ${currentName}`);
            return false;
        }
    } 
    catch (error) {
        throw error;
    }



    try{
        // Execute Sql command to database
        let times = 0;
        const sqlQuery = `UPDATE song SET name = ?, artist = ?, times_played = ${times} WHERE name = ?`;
        await connection.execute(sqlQuery, [newName, newArtist, times, currentName]);

        return true;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

async function counter(id) {
    try{
        // Execute Sql command to database
        const sqlQuery = `UPDATE song SET times_played = times_played + 1 WHERE id = ?`;
        await connection.execute(sqlQuery, [id]);

        return true;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }
}

/**
 * Deletes any song containing the specified name and artist
* @param {Number} id
* @returns {boolean} if db is now removed of that song
*/
async function remove(id){

    try{
        // Execute Sql command to database
        const sqlQuery = `DELETE FROM song WHERE id = ?`;
        await connection.execute(sqlQuery, [id]);

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
    findById,
    findAll,
    update,
    counter,
    remove,
    findTop,
    getConnection,
    endConnection,
    InvalidFileError,
    InvalidInputError,
    DatabaseExecutionError
}