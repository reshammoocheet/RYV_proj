const express = require('express');
const router = express.Router();
const routeRoot = '/';

const model = require('../models/song-model.js');


async function showForm(request, response) {
    let songs = await model.findAll()
    switch (request.body.choice) {
        case 'add':
            response.render('songs.hbs', { displayAddForm: true, songs: songs });
            break;
        case 'list':
            response.render('songs.hbs', { displayChoices: false, songs: songs  });
            break;
        case 'edit':
            response.render('songs.hbs', { displayEditForm: true, songs: songs  });
            break;
        case 'delete':
            response.render('songs.hbs', { displayDeleteForm: true, songs: songs  });
            break;
        default:
            response.render('songs.hbs');  // no valid choice made
    }
}
router.post('/songForms', showForm)
router.get('/song', readAllSongs)
router.post('/song', newSong);
router.post('/song-edit', updateSong)
router.post('/song-delete', deleteSong);

/**
 * READ of CRUD.
 * First READ is a list.
 * Calls model to read all songs.
 * @param {*} request: Express request expecting JSON body. 
 * @param {*} response: Sends a successful response, or a 500-level response if there is a system error
 */
async function readAllSongs(request, response) {
    try{
        let songs = await model.findAll();

        // if user is searching up a song
        const searchName = request.query.searchQuery;
        if(searchName){
            searchSong(songs, searchName)
        }
    
    
    
        const songPageData = {
            songs: songs,
            heading: "All songs",
            displayChoices: true
        }
    
    
        response.render('songs.hbs', songPageData)
    }
    catch (error) {
        // error handling.
        if (error instanceof model.DBConnectionError) {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "System error trying to read songs: " + error });
        } else {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "Unexpected error trying to read songs: " + error });
        }
    }

}



async function searchSong(songs, searchName){
        // loop through songs
        songs.forEach((song) =>{
            // if we find the song we need
            if(song.name == searchName){
                // get from database and display as sole song in table
                
                const songPageData = {
                    songs: [song],
                    heading: song.name,
                    displayChoices: true
                }
            
            
                response.render('songs.hbs', songPageData)
                return;
            }
        })

        response.render('error.hbs', {message: "Empty search"})
        return;

}
/**
 * Finds an song based on id
* @param {Object} request
* @param {Object} response
* @returns {Object} An song object
*/
async function newSong(request, response){
    const name = request.body.name;
    const artist = request.body.artist;

    try{
        const song = await model.create(name, artist);
        const songs = await model.findAll();
        const listPageData = {
            heading: `Song ${song.name} released in ${song.artist} was created successfully! `,
            songs: songs,
            displayChoices: true
        }

        response.render('songs.hbs', listPageData )
        //response.send(`Song ${song.name} released in ${song.artist} was created successfully! `)
        return song;
    }
    catch(error){
        if(error instanceof model.InvalidInputError){
            response.statusCode = 400;
            response.send(error.message);
        }
        else if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.send(error.message);
        }
        else{
            console.error(error.message);
            throw error;
        }
    }


}

/**
 * Finds an song based on id
* @param {Object} request
* @param {Object} response
* @returns {Array} An array of song objects
*/
async function listSong(request, response){
    try {
        const songs = await model.findAll();
    
        // if(songs.length == 0){
        //     const errorPageData = {
        //         heading: "Empty DB",
        //         message: 'The database does not contain any songs. '
        //     }
        //     response.render('error.hbs', errorPageData)
        //     return;
        // }

        const listPageData = {
            heading: 'Songs',
            songs: songs,
            displayChoices: true
        }
        response.render('songs.hbs', listPageData)
        //response.send(message);
        return songs;
    } 
    catch (error) {
        if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.send(error.message);
        }
        else{
            console.error(error.message);
            throw error;
        }
}


}

/**
 * Finds an song based on id
* @param {Object} request
* @param {Object} response
* @returns {Object} An song object
*/
async function findSongByTitle(request, response){
    const name = request.query.name;

    try {
        const songs = await model.findByTitle(name);
        if(songs[0]){
            response.send(`Song ${songs[0].name} was found successfully! `)
        }
        else{
            response.statusCode = 404;
            response.send(`Song could not be found. `)
        }
        return songs[0];
    } 
    catch (error) {
        if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.send(error.message);
        }
        else{
            console.error(error.message);
            throw error;
        }
    }

}

/**
 * Finds an song based on id
* @param {Object} request
* @param {Object} response
* @returns {boolean} Whether the song was edited successfully
*/
async function updateSong(request, response){
    const name = request.body.currentName;
    const newName = request.body.newName;
    const newArtist = request.body.newArtist;

    try {
        const success = await model.update(name, newName, newArtist);
        const songs = await model.findAll();
        const listPageData = {
            heading: `Song ${name} was updated successfully with new name: ${newName} and new artist: ${newArtist}. `,
            songs: songs,
            displayChoices: true
        }

        response.render('songs.hbs', listPageData )
        return success;
    } 
    catch (error) {
        if(error instanceof model.InvalidInputError){
            response.statusCode = 400;
            response.send(error.message);
        }
        else if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.send(error.message);
        }
        else{
            console.error(error.message);
            throw error;
        }

    }

}

/**
 * Finds an song based on id
* @param {Object} request
* @param {Object} response
* @returns {boolean} Whether the song was deleted successfully
*/
async function deleteSong(request, response){
    const name = request.body.name;
    const artist = request.body.artist;


    try {
        const success = await model.remove(name, artist);

        const songs = await model.findAll();
        const listPageData = {
            heading: `Song ${name} was removed successfully!`,
            songs: songs,
            displayChoices: true
        }

        response.render('songs.hbs', listPageData )
        return success;
    } 
    
    catch (error) {
        if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.send(error.message);
        }
        else{
            console.error(error.message);
            throw error;
        }
    }

}


module.exports = {
    router,
    routeRoot,
}