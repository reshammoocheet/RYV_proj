const express = require('express');
const { sessionManager } = require('../sessionManager');
const router = express.Router();
const routeRoot = '/';
router.get('/home', welcomePage);
router.get('/', welcomePage);

const model = require('../models/song-model');

async function welcomePage(request, response) {
    // check for valid session
    const authenticatedSession = sessionManager.authenticateUser(request);
    console.log(request.cookies);
    if(!authenticatedSession || authenticatedSession == null){
        response.render('login.hbs',{username: request.cookies.username, hideLogout: true});
        return;
    }

    // get songs.
    let songs = await model.findTop();

    console.log("User " + authenticatedSession.userSession.username + " is authorized for home page");

    response.render('home.hbs', { message: "Welcome, here's your most played songs! ", songs: songs});
}





module.exports = {
    router,
    routeRoot,
    welcomePage,

}