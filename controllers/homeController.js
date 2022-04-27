const express = require('express');
const router = express.Router();
const routeRoot = '/';


function welcomePage(request, response) {

    response.render('home.hbs', { message: "Welcome!" });
}

router.get('/charts', welcomePage);

module.exports = {
    router,
    routeRoot,
    welcomePage,

}