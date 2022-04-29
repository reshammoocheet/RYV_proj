const express = require('express');
const router = express.Router();
const routeRoot = '/';


function welcomePage(request, response) {

    response.render('home.hbs', { message: "Welcome!" });
}

function showLoginPage(request, response) {

    response.render('login.hbs', { message: "Welcome!" });
}

function showSignUpPage(request, response) {

    response.render('sign-up.hbs', { message: "Welcome!" });
}


router.get('/home', welcomePage);
router.get('/login', showLoginPage)
router.get('/signup', showSignUpPage)



module.exports = {
    router,
    routeRoot,
    welcomePage,
    showLoginPage,
    showSignUpPage,

}