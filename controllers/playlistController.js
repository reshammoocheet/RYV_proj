const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require('../models/playlist-model')
const { sessionManager } = require('../sessionManager');


router.post('/playlist', newPlaylist)
router.get('/playlists', listPlaylist)
router.get('/playlist', listPlaylist)
router.post('/playlist-edit', updatePlaylist)
router.post('/playlist-delete', deletePlaylist)

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
    const name = request.body.name;
    const description = request.body.description;

    try{
        const playlist = await model.create(name, description);
        const playlists = await model.findAll();
        const listPageData = {
            heading: `Playlist ${playlist.name} with description ${playlist.description} was created successfully! `,
            playlists: playlists,
            displayChoices: true
        }

        response.render('playlists.hbs', listPageData )
    }
    catch(error){
        if(error instanceof model.InvalidInputError){
            response.statusCode = 400;
            response.render('error.hbs', {message: error.message})
        }
        else if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.render('error.hbs', {message: error.message})
        }
        else{
            response.render('error.hbs', {message: error.message})
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
    // check for valid session
    const authenticatedSession = sessionManager.authenticateUser(request);
    if(!authenticatedSession || authenticatedSession == null){
        response.render('login.hbs',{username: request.cookies.username , hideLogout: true});
        return;
    }

    try {
        const playlists = await model.findAll();

        const listPageData = {
            heading: 'All Playlists',
            playlists: playlists,
            displayChoices: true
        }
        response.render('playlists.hbs', listPageData)
        return playlists;
    } 
    catch (error) {
        if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.render('error.hbs', {message: error.message})
        }
        else{
            response.render('error.hbs', {message: error.message})
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
    const currentName = request.body.currentName;
    const newName = request.body.newName;
    const newDescription = request.body.newDescription;

    try {
        const success = await model.update(currentName, newName, newDescription);
    
        const playlists = await model.findAll();
        const listPageData = {
            heading: `Playlist ${currentName} was updated successfully with new name: ${newName} and new description: ${newDescription}. `,
            playlists: playlists,
            displayChoices: true
        }

        response.render('playlists.hbs', listPageData )

        return success;
    } 
    catch (error) {
        if(error instanceof model.InvalidInputError){
            response.statusCode = 400;
            response.render('error.hbs', {message: error.message})
        }
        else if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.render('error.hbs', {message: error.message})
        }
        else{
            response.render('error.hbs', {message: error.message})
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
    const id = request.body.id;

    try {
        const success = await model.remove(id);

        const playlists = await model.findAll();
        const listPageData = {
            heading: `Playlist was removed successfully!`,
            playlists: playlists,
            displayChoices: true
        }

        response.render('playlists.hbs', listPageData )
        return success;
    } 
    
    catch (error) {
        if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.render('error.hbs', {message: error.message})
        }
        else{
            response.render('error.hbs', {message: error.message})
            throw error;
        }
    }

}


module.exports = {
    router,
    routeRoot
}