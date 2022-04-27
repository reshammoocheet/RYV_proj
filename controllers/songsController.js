const express = require('express');
const router = express.Router();
const routeRoot = '/';

const model = require('../models/topSongsModelMysql');

// ** Duplicates are implicitly checked for all methods ** //

/**
 * Handles post /song endpoint.
 * Calls the model to add a song to the database using the given position, name and artist.
 * CREATE of CRUD.
 * @param {*} request: Express request expecting JSON body with values request.body.position, request.body.name and request.body.artist 
 * @param {*} response: Sends a successful response, 400-level response if inputs are invalid or
 *                        a 500-level response if there is a system error
 */
async function createEntry(request, response) {
    try {
        const pos = await request.body.position;
        const name = await request.body.name;
        const artist = await request.body.artist;

        const added = await model.addSong(pos, name, artist);

        if (!added) {
            response.status("400");
            response.render("home.hbs", { alert: true, message: "Failed to add song for unknown reason" });
        } else {
            const data = added;
            response.render('showSong.hbs', { message: "Successfully added song", data: data });
        }
    } catch (error) {
        // error handling.
        if (error instanceof model.DBConnectionError) {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "System error trying to add song: " + error});
        } else if (error instanceof model.InvalidInputError) {
            response.status("400");
            response.render("home.hbs", { alert: true, message: "Validation error trying to add song: " + error });
        } else {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "Unexpected error trying to add song: " + error });
        }
    }
}

router.post('/song', createEntry);

/**
 * READ of CRUD.
 * First READ is a list.
 * Calls model to read all songs.
 * @param {*} request: Express request expecting JSON body. 
 * @param {*} response: Sends a successful response, or a 500-level response if there is a system error
 */
async function readChart(request, response) {
    try {
        const result = await model.readAllSongs();

        response.render('listSongs.hbs', { songsList: result[0], message: "Successfully listed songs" });

    } catch (error) {
        // error handling.
        if (error instanceof model.DBConnectionError) {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "System error trying to read songs: " + error });
        } else {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "Unexpected error trying to read songs: " + error });
        }
    }
}

router.get('/song', readChart)

/**
 * Second READ of CRUD is a single resource.
 * Calls the model to read song entry from position.
 * @param {*} request expecting JSON body with value request.params.position.
 * @param {*} response Sends a successful response, 400-level response if inputs are invalid or a 500-level response if there is a system error.
 */
async function readPosition(request, response) {
    try {
        const pos = parseInt(await request.params.position);
        const result = await model.readSong(pos);

        if (!result) {
            response.status("400");
            response.render("home.hbs", { alert: true, message: "Failed to read song for unknown reason" });
        } else {
            const data = result[0];
            response.render('showSong.hbs', { message: "Successfully read song", data: data[0] });
        }
    } catch (error) {
        // error handling.
        if (error instanceof model.DBConnectionError) {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "System error trying to read song: " + error });
        } else if (error instanceof model.InvalidInputError) {
            response.status("400");
            response.render("home.hbs", { alert: true, message: "Validation error trying to read song: " + error });
        } else {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "Unexpected error trying to read song: " + error });
        }
    }
}

router.get('/song/:position', readPosition);

/**
 * UPDATE of CRUD.
 * Calls the model to update a song entry from given values.
 * @param {*} request: Express request expecting JSON body with values request.query.position, request.query.name and request.query.artist 
 * @param {*} response: Sends a successful response, 400-level response if inputs are invalid or a 500-level response if there is a system error
 */
async function updateEntry(request, response) {
    try {
        const pos = parseInt(await request.body.position);
        const name = await request.body.name;
        const artist = await request.body.artist;

        const updated = await model.updateSong(pos, name, artist);

        if (!updated) {
            response.status("400");
            response.render("home.hbs", { alert: true, message: "Failed to update song for unknown reason" });
        } else {
            response.render('showSong.hbs', { message: "Successfully updated song", data: updated });
        }
    } catch (error) {
        // error handling.
        if (error instanceof model.DBConnectionError) {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "System error trying to update song: " + error });
        } else if (error instanceof model.InvalidInputError) {
            response.status("400");
            response.render("home.hbs", { alert: true, message: "Validation error trying to update song: " + error });
        } else {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "Unexpected error trying to update song: " + error });
        }
    }
}

router.post('/song-update', updateEntry);

/**
 * DELETE of CRUD. 
 * Calls model to delete song entry from position value.
 * @param {*} request expecting JSON body with value request.body.position.
 * @param {*} response Sends a successful response, 400-level response if inputs are invalid or a 500-level response if there is a system error.
 */
async function deleteEntry(request, response) {
    try {
        const pos = parseInt(await request.body.position);

        // First we want to save the fields.
        const fields = await model.readSong(pos);
        const data = fields[0];

        // Now we remove.
        const result = await model.removeSong(pos);

        if (!result) {
            response.status("400");
            response.render("home.hbs", { alert: true, message: "Failed to remove song for unknown reason" });
        } else {
            response.render('showSong.hbs', { message: "Successfully removed song", data: data[0] });
        }
    } catch (error) {
        // error handling.
        if (error instanceof model.DBConnectionError) {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "System error trying to remove song: " + error });
        } else if (error instanceof model.InvalidInputError) {
            response.status("400");
            response.render("home.hbs", { alert: true, message: "Validation error trying to remove song: " + error });
        } else {
            response.status("500");
            response.render("home.hbs", { alert: true, message: "Unexpected error trying to remove song: " + error });
        }
    }
}

router.post('/song-delete', deleteEntry);

module.exports = {
    router,
    routeRoot,
    createEntry,
    readChart,
    readPosition,
    updateEntry,
    deleteEntry
}