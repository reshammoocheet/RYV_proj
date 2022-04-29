const app = require('./app.js');
const port = 1339;
const songModel = require('./models/song-model');
const playlistModel = require('./models/playlist-model');

let dbName = 'music_db';

songModel.initialize(dbName, false);

playlistModel.initialize('music_db', false)
    .then(
        app.listen(port) // Run the server
    );
