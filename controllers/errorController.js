const express = require('express');
const router = express.Router();
const routeRoot = '/';

function error(request, response){
    // response.sendStatus(404); // not found
    response.status(404); 
    response.send("Invalid URL entered.  Please try again");
}

router.all('*', error);

module.exports = {
    router,
    routeRoot,
    error
}