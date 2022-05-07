const express = require('express');
const { sessionManager } = require('../sessionManager');
const router = express.Router();
const routeRoot = '/';
router.get('/home', welcomePage);


function welcomePage(request, response) {
    // check for valid session
    // const authenticatedSession = sessionManager.authenticateUser(request);
    // console.log(request.cookies);
    // if(!authenticatedSession || authenticatedSession == null){
    //     response.render('login.hbs');
    //     return;
    // }

    // console.log("User " + authenticatedSession.userSession.username + " is authorized for home page");

    response.render('home.hbs', { message: "Welcome!" });
}





module.exports = {
    router,
    routeRoot,
    welcomePage,

}