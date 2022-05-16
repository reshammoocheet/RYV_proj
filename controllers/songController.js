const express = require('express');
const router = express.Router();
const routeRoot = '/';
const { sessionManager } = require('../sessionManager');

const model = require('../models/song-model.js');
const playlistModel = require('../models/playlist-model');
const playlistSongModel = require('../models/playlist_song-model');

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
        case 'editInPlaylist':
            const playlistId = request.cookies.currentPlaylistId;
            const playlist = await playlistModel.findById(playlistId);
            const s = await playlistSongModel.findAllSongsInPlaylist(playlistId)
            response.render('playlists.hbs', {displayEditSongForm: true, songs: s, showPlaylist: true, heading: playlist.name, description: playlist.description})
            break;
        case 'deleteInPlaylist':
            const PlaylistId = request.cookies.currentPlaylistId;
            const S = await playlistSongModel.findAllSongsInPlaylist(PlaylistId)
            response.render('playlists.hbs', {displayDeleteSongForm: true, songs: S, showPlaylist: true})
            break;
        default:
            response.render('songs.hbs');  // no valid choice made
    }
}
router.post('/songForms', showForm)
router.get('/song', listSongs)
router.post('/song', newSong);
router.post('/song-edit', updateSong)
router.post('/song-delete', deleteSong);
router.post('/play', playSong);

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

/**
 * @param {*} request: Express request expecting JSON body. 
 * @param {*} response: Sends a successful response, or a 500-level response if there is a system error
 */
 async function playSong(request, response) {
    try{
        let songs = await model.findAll();
        let song = await model.findById(request.body.playSongId);

        // Counter.
        //await model.counter(request.body.playSongId);
        
        console.log(song)
        //request.cookies.tracks++;


        let found = false;
        if(song.name){
            // for every cookie in the cookies object
            for (const [key, value] of Object.entries(request.cookies)) {
                // if the cookie for this song exists
                if(key == song.name){
                    // increase its value
                    let newValue = parseInt(value);
                    newValue += 1;
                    response.cookie(key, newValue);
                    found = true;
                    break;
                }
            }
            // if does not exist then create it
            if(!found){
                response.cookie(song.name, 1);
            }
        }

        const songPageData = {
            songs: songs,
            heading: "All songs",
            displayChoices: true,
            playSong: song
        }
    
    
        response.render('songs.hbs', songPageData)
    }
    catch (error) {
        // error handling.
        if (error instanceof model.DatabaseExecutionError) {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "System error trying to read songs: " + error });
        } else {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "Unexpected error trying to read songs: " + error });
        }
    }

}



function searchSong(songs, searchName){
        // loop through songs
        songs.forEach((song) =>{
            // if we find the song we need
            if(song.name == searchName){
                return song;
            }
        })


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
            heading: `Song ${song.name} by ${song.artist} was created successfully! `,
            songs: songs,
            displayChoices: true
        }

        response.render('songs.hbs', listPageData )

        // Getting the uploaded file
        let audioFile;
        let uploadPath;

        if(!request.files || Object.keys(request.files).length === 0){
            return response.render('error.hbs', {message: 'No file was uploaded.'})
        }

        audioFile = request.files.audioFile;
        audioFile.name = song.name;
        console.log(__dirname)
        uploadPath = __dirname.replace("controllers", "public") + '/audio/' + audioFile.name + ".mp3";
        console.log(audioFile);

        audioFile.mv(uploadPath, function (err){
            if(err){
                response.render('error.hbs', {message: err.message})
            }
        })

        return song;
    }
    catch(error){
        if(error instanceof model.InvalidInputError){
            response.render('error.hbs', {message: error.message})
            response.statusCode = 400;
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
 * Finds an song based on id
* @param {Object} request
* @param {Object} response
* @returns {Array} An array of song objects
*/
async function listSongs(request, response){
    // check for valid session
    // const authenticatedSession = sessionManager.authenticateUser(request);
    // if(!authenticatedSession || authenticatedSession == null){
    //     response.render('login.hbs',{username: request.cookies.username, hideLogout: true});
    //     return;
    // }


    let isPremium = false;
    if(sessionManager.currentUser.isPremium == '1'){
        isPremium = true;

    }



    try {
        const songs = await model.findAll();

        // if user is searching up a song
        const searchName = request.query.searchQuery;
        if(searchName){
            // get from database and display as sole song in table
            let song;

            // loop through songs
            songs.forEach((s) =>{
                // if we find the song we need
                if(s.name == searchName){
                    song = s;
                }
            })


            if(song){
                const songPageData = {
                    songs: [song],
                    displayChoices: true,
                }
                response.render('songs.hbs', songPageData )
                return;
            }
            else{
                const songPageData = {
                    songs: songs,
                    heading: "Could not find song " + searchName,
                    displayChoices: true,
                }
                response.render('songs.hbs', songPageData )
                return;       
            }

        }

        const listPageData = {
            heading: 'Browse Songs',
            songs: songs,
            displayChoices: true
        }
        response.render('songs.hbs', listPageData)
        return songs;
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
            response.render('error.hbs', {message: error.message})
        }
        else if(error instanceof model.DatabaseExecutionError){
            response.statusCode = 500;
            response.render('error.hbs', {message: error.message})
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
    const id = request.body.id;


    try {
        const success = await model.remove(id);

        const songs = await model.findAll();
        const listPageData = {
            heading: `Song was removed successfully!`,
            songs: songs,
            displayChoices: true
        }

        response.render('songs.hbs', listPageData )
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
    routeRoot,
}