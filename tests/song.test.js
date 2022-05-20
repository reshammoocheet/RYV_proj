const app = require('../app');
const supertest = require("supertest");
let testRequest = supertest.agent(app);

/* Data to be used to generate random song for testing */
const songData = [
{ name: 'Location', artist: "Dave"},
{ name: 'Get Busy', artist: "Yeat" },
{ name: 'Magnolia', artist: "Playboi Carti" },
{ name: 'Jumpman', artist: "Drake"},
{ name: 'Low Life', artist: "Future" },
]

/** Since a Song can only be added to the DB once, we have to splice from the array. */
//const generateSongData = () => songData.splice(Math.floor((Math.random() * songData.length)), 1)[0];

// Slice version - Allows many tests without ever "running out" of generated song
const generateSongData = () => {
    const index = Math.floor((Math.random() * songData.length));
    return songData.slice(index, index+1)[0];
}

// Initialize database before proceeding
const dbName = "music_db_test";
const model = require('../models/song-model');
const playlistSongModel = require('../models/playlist_song-model');
const userModel = require('../models/user-model');
const { test, expect } = require('@jest/globals');
const { sessionManager } = require('../sessionManager');

/* Make sure the database is empty before each test.  This runs before each test.  See https://jestjs.io/docs/api */
beforeEach(async () => {
    try {
        testRequest = supertest.agent(app);
        await model.initialize(dbName, true);
        await playlistSongModel.initialize(dbName, true);
        await userModel.initialize(dbName, true)
     } 
    catch (err) {
        console.error(err);
    }
});

// CREATE
test("POST /song success case", async () => {
    // Create Song
    const { name, artist } = generateSongData();
    const testResponse = await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Song ${name} by ${artist} was created successfully! `)
});

test("POST /song fail case with blank name", async () => {
    // Create Song
    const { name, artist } = generateSongData();
    const testResponse = await testRequest.post('/song').send({
        name: "",
        artist: artist
    })

    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`Invalid input when trying to create  by ${artist}. `)
});

test("POST /song fail case with invalid artist", async () => {
    // Create Song
    const { name, artist } = generateSongData();
    const testResponse = await testRequest.post('/song').send({
        name: name,
        artist: ''
    })

    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`Invalid input when trying to create ${name} by . `);
})



    

// READ
test("GET /song full list of songs", async () => {

    const registerResponse = await testRequest.post('/register').send({
        username:"aaa",
        password:"Abcd123!",});
    const loginResponse = await testRequest.post('/login').send({
            username:"aaa",
            password:"Abcd123!"});

    expect (registerResponse.status).toBe(302);
    expect (loginResponse.get('Set-Cookie')).toBeDefined();

    // Fill db with list of songs
    await testRequest.post('/song').send({
        name: "name1",
        artist: "artist1"
    });

    await testRequest.post('/song').send({
        name: "name2",
        artist: "artist2"
    });

    await testRequest.post('/song').send({
        name: "name3",
        artist: "artist3"
    });



    const testResponse = await testRequest.get('/songs');
    expect(testResponse.status).toBe(200);
});
    
test("GET /song search success case", async () => { 
    const registerResponse = await testRequest.post('/register').send({
        username:"aaa",
        password:"Abcd123!",});
    const loginResponse = await testRequest.post('/login').send({
            username:"aaa",
            password:"Abcd123!"});

    expect (registerResponse.status).toBe(302);
    expect (loginResponse.get('Set-Cookie')).toBeDefined();

    // Create Song
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    });

    // Find Previously Created Song
    const testResponse = await testRequest.get(`/song?searchQuery=${name}`);


    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(name)


});

test("GET /song search fail case", async () => {
    const registerResponse = await testRequest.post('/register').send({
        username:"aaa",
        password:"Abcd123!",});
    const loginResponse = await testRequest.post('/login').send({
            username:"aaa",
            password:"Abcd123!"});

    expect (registerResponse.status).toBe(302);
    expect (loginResponse.get('Set-Cookie')).toBeDefined();

    // Try and find song that does not exist
    const search = "aaaas"
    const testResponse = await testRequest.get(`/song?searchQuery=${search}`);


    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Could not find song ${search}`)


});




// UPDATE
test("POST /song-edit success case", async () => {
    // Create new Song to test edit
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    // Edit with new name
    const newName = "New Title";
    const newArtist = "new artist";

    const testResponse = await testRequest.post('/song-edit').send({
        currentName: name,
        newName: newName,
        newArtist: newArtist
    });
    
    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Song ${name} was updated successfully with new name: ${newName} and new artist: ${newArtist}. `);
});


test("POST /song-edit fail case with invalid new name", async () => {
    // Create new Song to test edit
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    // Edit with invalid new name
    const newName = "";
    const newArtist = "new artist";

    const testResponse = await testRequest.post('/song-edit').send({
        currentName: "",
        newName: newName,
        newArtist: newArtist
    });
    
    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`try again`);
});


test("POST /song-edit fail case with invalid new artist", async () => {
    // Create new Song to test edit
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    // Edit with invalid new artist
    const newName = "New Title";
    const newArtist = "";

    const testResponse = await testRequest.post('/song-edit').send({
        currentName: name,
        newName: newName,
        newArtist: newArtist
    });
    
    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`try again`);
});





// DELETE
test("DELETE /song success case", async () => {
    // Create new Song to test remove
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    const song = await model.findByName(name);


    // Remove created song
    const testResponse = await testRequest.post('/song-delete').send({
        id: song[0].id
    });

    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Song was removed successfully!`);
});

// DELETE
test("DELETE /song fail case", async () => {
    // Create new Song to test remove
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    const song = await model.findByName(name);
    model.endConnection();

    // Remove created song
    const testResponse = await testRequest.post('/song-delete').send({
        id: song[0].id
    });

    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toContain(`Sorry there was a problem with the server`);
});

test("POST /song fail case with closed connection", async () => {
    // Create Song
    const { name, artist } = generateSongData();

    model.endConnection();
    
    const testResponse = await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toContain(`add new command when connection is in closed state`);
});

test("POST /song-edit fail case with closed connection", async () => {
    // Create new Song to test edit
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    // Edit with invalid new artist
    const newName = "New Title";
    const newArtist = "new artist";

    model.endConnection();

    const testResponse = await testRequest.post('/song-edit').send({
        currentName: name,
        newName: newName,
        newArtist: newArtist
    });
    
    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toContain(`add new command when connection is in closed state`);
});

test("GET /song fail case with closed connection", async () => {
    const registerResponse = await testRequest.post('/register').send({
        username:"aaa",
        password:"Abcd123!",});
    const loginResponse = await testRequest.post('/login').send({
            username:"aaa",
            password:"Abcd123!"});

    expect (registerResponse.status).toBe(302);
    expect (loginResponse.get('Set-Cookie')).toBeDefined();

    // Create Song
    const { name, artist } = generateSongData();

    model.endConnection();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    });

    // Find Previously Created Song
    const testResponse = await testRequest.get(`/song?name=${name}`);


    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toContain(`add new command when connection is in closed state`)


});


afterEach(async () => {
    connection = model.getConnection();
    if (connection) {
        //await connection.close();
    } 
})