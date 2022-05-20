const express = require('express');
const router = express.Router();
const routeRoot = '/';
/**
 * Renders the error page
 * @param {Object} request 
 * @param {Object} response 
 */
function error(request, response){
    response.render('error.hbs', {message: "Invalid URL! Press Home to go to the main page."})
}

router.all('*', error);

module.exports = {
    router,
    routeRoot,
    error
}