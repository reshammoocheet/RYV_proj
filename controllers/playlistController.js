const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require('../models/playlist-model')


router.post('/playlist', newPlaylist)
router.get('/playlists', listPlaylist)
router.get('/playlist', listPlaylist)
router.post('/playlist/edit', updatePlaylist)
router.post('/playlist/delete', deletePlaylist)

async function showForm(request, response) {
    let playlists = await model.findAll();

    switch (request.body.choice) {
        case 'add':
            response.render('playlists.hbs', { displayAddForm: true, playlists: playlists });
            break;
        case 'list':
            response.render('playlists.hbs', { displayChoices: false, playlists: playlists  });
            break;
        case 'edit':
            response.render('playlists.hbs', { displayEditForm: true, playlists: playlists  });
            break;
        case 'delete':
            response.render('playlists.hbs', { displayDeleteForm: true, playlists: playlists  });
            break;
        default:
            response.render('playlists.hbs');  // no valid choice made
    }
}
router.post('/playlistForms', showForm)


/**
 * Finds an playlist based on id
* @param {Object} request
* @param {Object} response
* @returns {Object} An playlist object
*/
async function newPlaylist(request, response){
    const title = request.body.title;
    const year = request.body.year;

    try{
        const playlist = await model.create(title, year);
        response.send(`Playlist ${playlist.title} released in ${playlist.year} was created successfully! `)
        return playlist;
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
 * Finds an playlist based on id
* @param {Object} request
* @param {Object} response
* @returns {Array} An array of playlist objects
*/
async function listPlaylist(request, response){
    try {
        const playlists = await model.findAll();
    
        // if(playlists.length == 0){
        //     const errorPageData = {
        //         heading: "Empty DB",
        //         message: 'The database does not contain any playlists. '
        //     }
        //     response.render('error.hbs', errorPageData)
        //     return;
        // }

        const listPageData = {
            heading: 'Playlists',
            playlists: playlists,
            displayChoices: true
        }
        response.render('playlists.hbs', listPageData)
        //response.send(message);
        return playlists;
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
 * Finds an playlist based on id
* @param {Object} request
* @param {Object} response
* @returns {Object} An playlist object
*/
async function findPlaylistByTitle(request, response){
    const title = request.query.title;

    try {
        const playlists = await model.findByTitle(title);
        if(playlists[0]){
            response.send(`Playlist ${playlists[0].title} was found successfully! `)
        }
        else{
            response.statusCode = 404;
            response.send(`Playlist could not be found. `)
        }
        return playlists[0];
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
 * Finds an playlist based on id
* @param {Object} request
* @param {Object} response
* @returns {boolean} Whether the playlist was edited successfully
*/
async function updatePlaylist(request, response){
    const title = request.body.currentTitle;
    const newTitle = request.body.newTitle;
    const newYear = request.body.newYear;

    try {
        const success = await model.update(title, newTitle, newYear);

        response.send(`Playlist ${title} was updated successfully with new title: ${newTitle} and new year: ${newYear}. `)
    
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
 * Finds an playlist based on id
* @param {Object} request
* @param {Object} response
* @returns {boolean} Whether the playlist was deleted successfully
*/
async function deletePlaylist(request, response){
    const title = request.body.title;
    const year = request.body.year;


    try {
        const success = await model.remove(title, year);
        response.send(`Playlist ${title} was removed successfully!`)
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
    routeRoot
}