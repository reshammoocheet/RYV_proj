const express = require('express');
const { sessionManager } = require('../sessionManager');
const router = express.Router();
const routeRoot = '/';
const validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const model = require('../models/user-model.js');
const { update } = require('../models/song-model');
let isPremium = false;

router.post('/login', loginUser)
router.get('/logout', logoutUser);
router.post('/register', registerUser)
router.get('/signup', signupPage)
router.post('/signup', signupPage)
router.get('/profile', showProfilePage);
router.post('/profileForms', showForm)
router.post('/user-edit', updateUser)


async function showForm(request, response) {
    switch (request.body.choice) {
        case 'username':
            response.render('profile.hbs', { displayUsernameForm: true });
            break;
        case 'password':
            response.render('profile.hbs', { displayPasswordForm: true });
            break;
        case 'premium':
            response.render('profile.hbs', { displayPremiumForm: true});
            break;
        default:
            response.render('songs.hbs');  // no valid choice made
    }
}

function showProfilePage(request, response){
    // check for valid session
    const authenticatedSession = sessionManager.authenticateUser(request);
    if(!authenticatedSession || authenticatedSession == null){
        response.render('login.hbs',{username: request.cookies.username, hideLogout: true});
        return;
    }
    response.render('profile.hbs', {displayChoices: true})
}

function signupPage(request, response){
    isPremium = false;

    if(request.body.buyButton != null){
        isPremium = true;
    }
    response.render('sign-up.hbs',{hideLogout: true, showPaypal: isPremium});
}

async function loginUser(request, response){
    console.log("hesfib")

    // Let's assume successful login for now with placeholder username
    const username = request.body.username;
    const password = request.body.password;
    const users = await model.findAll();
    const user = await model.findByUsername(username);

    console.log(user)

    if(user.length < 1){
        response.render('login.hbs', {errorMessage: "Invalid username given for user: " + username})
        return;
    }

    if (username && password && user) {
        // Validate the password against our data.
        // If invalid, redirect to the main page without creating a session cookie.
        const expectedPassword = user[0].password;
        console.log(expectedPassword);
        console.log(password);
        if (expectedPassword && await bcrypt.compare(password, expectedPassword)) {                     
            console.log("Successful login for user " + username);
            console.log(user);
            // set the currentUser of the session to this user.
            sessionManager.currentUser = user[0];
            // Create a session object that will expire in 2 minutes
            const sessionId = sessionManager.createSession(username, 120);
            // Save cookie that will expire.
            response.cookie("sessionId", sessionId, { expires: sessionManager.sessions[sessionId].expiresAt });
            response.cookie("username", username);
        } 
        else {
            response.render('login.hbs', {errorMessage: "Invalid username / password given for user: " + username , hideLogout: true})
            console.log("Invalid username / password given for user: " + username);
            return;
        }
        //response.render('home.hbs',  { message: "Welcome!" }); // Redirect to main page (whether session was set or not)
        response.redirect('/home');
    }
}

async function registerUser(request, response){
    console.log(request.body)
    console.log(request.body.isPremium)
    const username = request.body.username;
    const password = request.body.password;
    const isPremium = request.body.isPremium == "on";

    const user = await model.findByUsername(username);

    if (username && password) {
        // Check to see if the user already exists.  If not, then create it.
        if (user.length > 0) {
            console.log("Invalid registration - username " + username + ' already exists.');
            response.render("login.hbs", {errorMessage: "Invalid registration - username " + username + ' already exists.',username: request.cookies.username, hideLogout: true});
            return;
        } 
        else if(validator.isAlphanumeric(username)){
            console.log("Registering username " + username);
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await model.create(username, hashedPassword, isPremium);
        }
        else {
            response.render("login.hbs", {errorMessage: "Password was not strong enough.",username: request.cookies.username, hideLogout: true})
            console.log("Password was not strong enough.")
            return
        }
    }
    const users = await model.findAll();
    console.log(users);
    response.redirect('/home'); // Redirect to main page whether successful or not.  We require the user to login in after registering.

}

async function logoutUser(request, response){
    const authenticatedSession = sessionManager.authenticateUser(request);
    if (!authenticatedSession) {
        response.redirect('/home'); // Unauthorized access
        return;
    }
    delete sessionManager.sessions[authenticatedSession.sessionId]
    console.log("Logged out user " + authenticatedSession.userSession.username);

    response.cookie("sessionId", "", { expires: new Date() }); // "erase" cookie by forcing it to expire.
    response.redirect('/home');

}

async function updateUser(request, response){
    const username = request.body.currentUsername;
    const newUsername = request.body.currentPassword ? request.body.currentUsername : request.body.newUsername;
    const newPassword = await bcrypt.hash(request.body.newPassword, 10);


    try {
        const success = await model.update(username, newUsername, newPassword);
        const songs = await model.findAll();
        const listPageData = {
            message: `User ${username} was updated successfully with ${newUsername}. `,
        }

        response.render('home.hbs', listPageData )
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

module.exports = {
    router, 
    routeRoot,
    registerUser,
    loginUser,
    logoutUser
}

