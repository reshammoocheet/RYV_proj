const app = require('./app.js');
const port = 1339;
const songModel = require('./models/song-model');
const playlistModel = require('./models/playlist-model');
const userModel = require('./models/user-model');
const playlistSongModel = require('./models/playlist_song-model')
let dbName = 'music_db';

songModel.initialize(dbName, false);
playlistModel.initialize(dbName, false)
playlistSongModel.initialize(dbName, false)
userModel.initialize(dbName, false)
    .then(
        app.listen(port) // Run the server
    );
