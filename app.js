const express = require('express');
const app = express();

const {engine} = require('express-handlebars');
const bodyParser = require('body-parser');

// const pinohttp = require('pino-http');
const expressListRoutes = require('express-list-routes');


// Tell the app to use handlebars templating engine.  
//   Configure the engine to use a simple .hbs extension to simplify file naming
app.engine('hbs', engine({ extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', './views');  // indicate folder for views
// Add support for forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'))

app.use(express.json());

// Make sure errorController is last!
const controllers = ['homeController', 'songController', 'playlistController', 'errorController'] 


// Register routes from all controllers 
//  (Assumes a flat directory structure and common 'routeRoot' / 'router' export)
controllers.forEach((controllerName) => {
    try {
        const controllerRoutes = require('./controllers/' + controllerName);
        app.use(controllerRoutes.routeRoot, controllerRoutes.router);
    } catch (error) {
      //fail gracefully if no routes for this controller
       console.log(error);
    }    
})

expressListRoutes(app, {prefix: '/'});

module.exports = app
