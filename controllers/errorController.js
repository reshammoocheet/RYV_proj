const express = require('express');
const router = express.Router();
const routeRoot = '/';

function error(request, response){
    response.render('error.hbs', {message: "Invalid URL! Press Home to go to the main page."})
}

router.all('*', error);

module.exports = {
    router,
    routeRoot,
    error
}