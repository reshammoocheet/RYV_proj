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
        const dropQuery = "DROP TABLE IF EXISTS playlist_song";
        try{
            await connection.execute(dropQuery);
        }
        catch(error){
            console.error(error.message);
        }
    }

    try{
        const sqlQuery = 'CREATE TABLE IF NOT EXISTS playlist_song(playlist_id int, song_id int, PRIMARY KEY (playlist_id))';
        await connection.execute(sqlQuery);
    }
    catch(error){
        console.error(error);
    }
}


/**
 * Creates a new playlist_song based on its song_id and release playlist_id.
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
 * Creates a new playlist_song based on its song_id and release playlist_id.
* @param {string} song_id
* @param {number} playlist_id
* @returns {Object} An playlist_song Object
*/
async function create(song_id, playlist_id){

    try{
        // Execute Sql command to database
        const sqlQuery = `INSERT INTO playlist_song (song_id, playlist_song_id) VALUES (?, ?)`;
        await connection.execute(sqlQuery, [song_id, playlist_id]);

        // return created playlist_song
        const playlist_song = {"song_id": song_id, "playlist_id": playlist_id}
        return playlist_song;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Finds an playlist_song based on id
* @param {number} id
* @returns {Object} An playlist_song object
*/
async function findById(id){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM playlist_song WHERE id = ?`;
        const [playlists, fields] = await connection.execute(sqlQuery, [id]);

        return playlists[0];
    }
    catch(error){
        console.error(error.message);
        return null;
    }

}

/**
 * Finds a playlist_song based on its playlist_id
* @param {string} playlist_id
* @returns {Array} An array of playlist_song objects
*/
async function findAllSongsInPlaylist(playlist_id){
    try{
        // Execute Sql command to database
        const sqlQuery = `SELECT * FROM playlist_song WHERE playlist_id = ?`;
        const [songs, fields] = await connection.execute(sqlQuery, [playlist_id]);

        return songs;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Finds all playlists in the table
* @returns {Array} An array of playlist_song objects
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
 * Updates an playlist_song with a new song_id and playlist_id.
* @param {string} currentName
* @param {string} newName
* @param {number} newDescription
* @returns {boolean} whether update was successful
*/
async function update(currentName, newName, newDescription){

    try {
        if(await findByName(currentName) == null){
            console.error(`No such playlist_song with song_id ${currentName}`);
            return false;
        }
    } 
    catch (error) {
        throw error;
    }



    try{
        // Execute Sql command to database
        const sqlQuery = `UPDATE playlist_song SET song_id = ?, playlist_id = ? WHERE song_id = ?`;
        await connection.execute(sqlQuery, [newName, newDescription, currentName]);

        return true;
    }
    catch(error){
        console.error(error.message);
        throw new DatabaseExecutionError(error.message);
    }

}

/**
 * Deletes any playlist_song containing the specified song_id and playlist_id
* @param {Number} id
* @returns {boolean} if db is now removed of that playlist
*/
async function remove(id){


    try{
        // Execute Sql command to database
        const sqlQuery = `DELETE FROM playlist_song WHERE id = ?`;
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
    findAllSongsInPlaylist,
    findById,
    findAll,
    update,
    remove,
    getConnection,
    endConnection,
    InvalidFileError,
    InvalidInputError,
    DatabaseExecutionError
}