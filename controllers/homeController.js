const express = require('express');
const { sessionManager } = require('../sessionManager');
const router = express.Router();
const routeRoot = '/';
router.get('/home', welcomePage);
router.get('/home/search', searchSong);
router.get('/', welcomePage);
router.get('/aboutUs', renderAboutUs)
const model = require('../models/song-model');

/**
 * Renders the About Us page
 * @param {Object} request 
 * @param {Object} response 
 */
function renderAboutUs(request, response){

    response.render('aboutUs.hbs',{hideLogout: true});

}
/**
 * Renders the Home/Login page
 * @param {Object} request 
 * @param {Object} response 
 */
async function welcomePage(request, response) {
    // check for valid session
    const authenticatedSession = sessionManager.authenticateUser(request);
    if(!authenticatedSession || authenticatedSession == null){
        response.render('login.hbs',{username: request.cookies.username, hideLogout: true});
        return;
    }


    let songs = await getTopSongs(request);

    // console.log("User " + authenticatedSession.userSession.username + " is authorized for home page");

    if(songs.length > 0){
        response.render('home.hbs', { message: "Welcome, here are some suggested songs.", songs: songs});
    }
    else{
        response.render('home.hbs', { message: "Welcome!"});
    }
}
/**
 * Get and sorts the most played songs in order of times played
 * @param {Object} request 
 * @returns {Array} the songs ordered by the most played
 */
async function getTopSongs(request){
    let songs = [];
    // for each cookie
    for (const [key, value] of Object.entries(request.cookies)) {
        // find the song with that name
        let song = await model.findByName(key);
        // findByName returns an array of songs with that name so we check if its not empty
        if(song.length > 0){
            // add it to the top songs
            song[0].timesPlayed = parseInt(value);
            songs.push(song[0]);
        }
    }

    songs.sort((a, b) => (a.timesPlayed < b.timesPlayed) ? 1 : -1)
    return songs;
}
/**
 * Searchs the looked up song
 * @param {Array} songs 
 * @param {string} searchName
 * @returns {Object} the searched song 
 */
function searchSong(songs, searchName){
    // loop through songs
    songs.forEach((song) =>{
        // if we find the song we need
        if(song.name == searchName){
            return song;
        }
    })


}




module.exports = {
    router,
    routeRoot,
    welcomePage,

}