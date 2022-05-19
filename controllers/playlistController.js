const express = require('express');
const router = express.Router();
const routeRoot = '/';
const model = require('../models/playlist-model');
const playlist_song_model = require('../models/playlist_song-model')
const { sessionManager } = require('../sessionManager');
const songModel = require('../models/song-model');

router.post('/playlist', newPlaylist)
router.get('/playlists', listPlaylist)
router.get('/playlist', listPlaylist)
router.post('/showPlaylist', showPlaylist)
router.post('/playlist-edit', updatePlaylist)
router.post('/playlist-delete', deletePlaylist)
router.post('/addSong', addToPlaylistForm);
router.post('/addToPlaylist', addToPlaylist)
router.post('/removeSongFromPlaylist', removeSongFromPlaylist)
router.post('/playlistForms', showForm)

async function showForm(request, response) {
    let playlists = await model.findByUserId(sessionManager.currentUser.id);

    switch (request.body.choice) {
        case 'addForm':
            response.render('playlists.hbs', { displayAddForm: true, playlists: playlists, heading: "My Library" });
            break;
        case 'editForm':
            response.render('playlists.hbs', { displayEditForm: true, playlists: playlists  });
            break;
        case 'deleteForm':
            response.render('playlists.hbs', { displayDeleteForm: true, playlists: playlists  });
            break;
        case 'addSongForm':
            response.render('playlists.hbs', { displayAddHereForm: true, playlists: playlists });
            break;
        default:
            response.render('playlists.hbs');  // no valid choice made
    }
}


/**
 * Finds an playlist based on id
* @param {Object} request
* @param {Object} response
* @returns {Object} An playlist object
*/
async function newPlaylist(request, response){
    const name = request.body.name;
    const description = request.body.description;
    const user = request.cookies.currentUser ;

    try{
        let playlist;
        let playlists;

        if(user){
            playlist = await model.create(name, user[0].id, description);
            playlists = await model.findByUserId(user[0].id);
        }
        else{
            playlist = await model.create(name, 0, description);
            playlists = await model.findAll();
        }
        const listPageData = {
            heading: `Playlist ${playlist.name} with description '${playlist.description}' was created successfully! `,
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
    if((!authenticatedSession || authenticatedSession == null) && !sessionManager.DEBUG){
        response.render('login.hbs',{username: request.cookies.username , hideLogout: true});
        return;
    }

    try {
        const userId = sessionManager.currentUser.id;
        let playlists;
        if(userId){
            playlists = await model.findByUserId(userId);
        }
        else{
            playlists = await model.findAll();
        }

        let isEmpty = playlists.length == 0;
        // if user is searching up a song
        const searchName = request.query.searchQuery;
        if(searchName){
            // get from database and display as sole song in table
            let playlist;

            // loop through songs
            playlists.forEach((p) =>{
                // if we find the song we need
                if(p.name.toLowerCase() == searchName.toLowerCase()){
                    playlist = p;
                }
            })


            if(playlist){
                console.log(playlist)
                const playlistPageData = {
                    playlists: [playlist],
                    heading: "My Library",
                    displayChoices: true,
                    isEmpty: isEmpty
                }
                response.render('playlists.hbs', playlistPageData )
                return;
            }
            else{
                const playlistPageData = {
                    playlists: playlists,
                    heading: "Could not find playlist " + searchName,
                    displayChoices: true,
                    isEmpty: isEmpty
                }
                response.render('playlists.hbs', playlistPageData )
                return;       
            }

        }

        const listPageData = {
            heading: 'My Library',
            playlists: playlists,
            displayChoices: true,
            isEmpty: isEmpty
        }
        response.render('playlists.hbs', listPageData)
        return playlists;
    } 
    catch (error) {
        // This error appears from time to time for no reason so we just try again
        if(error.message == "Cannot read property 'execute' of undefined"){
            listSongs(request, response);
        }
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

async function showPlaylist(request, response){

    const id = request.body.playlistId;

    try {
        const songs = await playlist_song_model.findAllSongsInPlaylist(id);
        const playlist = await model.findById(id);
        response.cookie("currentPlaylistId", id)
        
        let isEmpty = false;
        if(songs.length < 1){
            isEmpty = true;
        }

        const listPageData = {
            heading: "Playlist: " + playlist.name,
            description: playlist.description,
            songs: songs,
            displayChoices: false,
            displayPlaylistChoices: true,
            showPlaylist: true,
            isEmpty: isEmpty
        }
        response.render('playlists.hbs', listPageData)
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

async function addToPlaylistForm(request, response){
    try {

        const playlists = await model.findByUserId(sessionManager.currentUser.id);
        const song = await songModel.findById(request.body.songId);
        response.cookie("songToAddId", song.id);

        const listPageData = {
            heading: `Choose a playlist to add ${song.name} to.`,
            playlists: playlists,
            displayChoices: false,
        }
        response.render('addToPlaylist.hbs', listPageData)
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

async function addToPlaylist(request, response){
    const id = request.body.id;
    try {

        const playlists = await model.findByUserId(request.cookies.currentUser[0].id);
        const playlist = await model.findById(request.body.playlistId);
        const song = await songModel.findById(request.cookies.songToAddId);
        const playlist_song = await playlist_song_model.create(song.id, playlist.id);

        const listPageData = {
            heading: `Successfully added ${song.name} to .`,
            playlists: playlists,
            displayChoices: true,
        }
        request.body.playlistId = playlist.id;
        showPlaylist(request, response)
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
    
        if(success){
            const playlists = await model.findByUserId(request.cookies.currentUser[0].id);
            const listPageData = {
                heading: `Playlist ${currentName} was updated successfully with new name: ${newName} and new description: ${newDescription} `,
                playlists: playlists,
                displayChoices: true
            }
    
            response.render('playlists.hbs', listPageData )
        }
        else{
            const playlists = await model.findByUserId(request.cookies.currentUser[0].id);
            const listPageData = {
                heading: `No playlist exists with this name`,
                playlists: playlists,
                displayChoices: true
            }
    
            response.render('playlists.hbs', listPageData )   
        }


    } 
    catch (error) {
        if(error instanceof model.InvalidInputError){
            response.statusCode = 400;
            const playlists = await model.findByUserId(request.cookies.currentUser[0].id);
            const listPageData = {
                heading: `Please try again with valid input`,
                playlists: playlists,
                displayChoices: true
            }
    
            response.render('playlists.hbs', listPageData ) 
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
        const playlists = await model.findByUserId(request.cookies.currentUser[0].id);
        if(!id){
            const listPageData = {
                heading: `Playlist could not be deleted`,
                playlists: playlists,
                displayChoices: true,
                isEmpty: playlists.length < 1
            }
            response.status(400)
            response.render('playlists.hbs', listPageData )
            return;
        }
        
        const success = await model.remove(id);

        if(!success){
            const listPageData = {
                heading: `Playlist could not be deleted`,
                playlists: playlists,
                displayChoices: true,
                isEmpty: playlists.length < 1
            }
            response.status(400)
            response.render('playlists.hbs', listPageData )
            return;
        }

        const listPageData = {
            heading: `Playlist was removed successfully!`,
            playlists: playlists,
            displayChoices: true,
            isEmpty: playlists.length < 1
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

async function removeSongFromPlaylist(request, response){
    const songId = request.body.songId;
    const playlistId = request.cookies.currentPlaylistId;

    try {
        const success = await playlist_song_model.remove(songId, playlistId);
        const song = await songModel.findById(songId);

        const playlists = await model.findByUserId(request.cookies.currentUser[0].id);
        const listPageData = {
            heading: `Song ${song.name} was removed successfully!`,
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