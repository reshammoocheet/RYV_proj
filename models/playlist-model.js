const mysql = require('mysql2/promise');
const validateUtils = require('../validateUtils');

var connection;

/**
 * Initializes Database and creates Playlist table with ID, Title and Release Year as fields if the table does not already exist
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
        const dropQuery = "DROP TABLE IF EXISTS playlist";
        try{
            await connection.execute(dropQuery);
        }
        catch(error){
            console.error(error.message);
        }
    }

    try{
        const sqlQuery = 'CREATE TABLE IF NOT EXISTS playlist(id int AUTO_INCREMENT, title VARCHAR(50), year INT, PRIMARY KEY (id))';
        await connection.execute(sqlQuery);
    }
    catch(error){
        console.error(error);
    }
}


/**
 * Creates a new playlist based on its title and release year.
* @param {string} tableTitle
* @returns {boolean} success of truncate
*/
async function truncate(tableTitle){
    try{
        const sqlQuery = `TRUNCATE TABLE ${tableTitle}`;
        await connection.execute(sqlQuery);
        return true;
    }
    catch(error){
        console.error(error);
        return false;
    }
}

/**
 * Creates a new playlist based on its title and release year.
* @param {string} title
* @param {number} year
* @returns {Object} An playlist Object
*/
async function create(title, year){
    // Validate Input
    if(!validateUtils.isValid(title, year)){
        throw new InvalidInputError(`Invalid input when trying to create ${title} released in ${year}. `);
    }

    // check if playlist already exists
    const playlists = await findByTitle(title);
    if(playlists.length > 0){
        throw new InvalidInputError(`${title} already exists. `);
    }

    try{
        // Execute Sql command to database
        const sqlQuery = `INSERT INTO playlist (title, year) VALUES (?, ?)`;
        await connection.execute(sqlQuery, [title, year]);

        // return created playlist
        const playlist = {"title": title, "year": year}
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
        const [playlists, fields] = await connection.execute(sqlQuery, [title]);

        return playlists[0];
    }
    catch(error){
        console.error(error.message);
        return null;
    }

}

/**
 * Finds an playlist based on its title
* @param {string} title
* @returns {Array} An array of playlist objects
*/
async function findByTitle(title){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM playlist WHERE title = ?`;
        const [playlists, fields] = await connection.execute(sqlQuery, [title]);

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
 * Updates an playlist with a new title and year.
* @param {string} currentTitle
* @param {string} newTitle
* @param {number} newYear
* @returns {boolean} whether update was successful
*/
async function update(currentTitle, newTitle, newYear){
    // Validate Input for both current and new title, and make sure element exists
    if(!validateUtils.isValid(newTitle, newYear)){
        throw new InvalidInputError(`Invalid input when trying to update fields to ${newTitle} and ${newYear}`);
    }

    try {
        if(await findByTitle(currentTitle) == null){
            console.error(`No such playlist with title ${currentTitle}`);
            return false;
        }
    } 
    catch (error) {
        throw error;
    }



    try{
        // Execute Sql command to database
        const sqlQuery = `UPDATE playlist SET title = ?, year = ? WHERE title = ?`;
        await connection.execute(sqlQuery, [newTitle, newYear, currentTitle]);

        return true;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Deletes any playlist containing the specified title and year
* @param {string} title
* @param {number} year
* @returns {boolean} if db is now removed of that playlist
*/
async function remove(title, year){

    // if playlist doesn't exist
    if(findByTitle(title).length < 1){
        return false;
    }

    try{
        // Execute Sql command to database
        const sqlQuery = `DELETE FROM playlist WHERE title = ? AND year = ?`;
        await connection.execute(sqlQuery, [title, year]);

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
    findByTitle,
    findAll,
    update,
    remove,
    getConnection,
    endConnection,
    InvalidFileError,
    InvalidInputError,
    DatabaseExecutionError
}