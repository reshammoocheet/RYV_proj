const app = require('../app');
const supertest = require("supertest");
const testRequest = supertest(app);

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
const { test, expect } = require('@jest/globals');

/* Make sure the database is empty before each test.  This runs before each test.  See https://jestjs.io/docs/api */
beforeEach(async () => {
    try {
        await model.initialize(dbName, true);
     } 
    catch (err) {
        console.error(err);
    }
});

// CREATE
test.only("POST /song success case", async () => {
    // Create Song
    const { name, artist } = generateSongData();
    const testResponse = await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Song ${name} by ${artist} was created successfully! `)
});

test.only("POST /song fail case with blank name", async () => {
    // Create Song
    const { name, artist } = generateSongData();
    const testResponse = await testRequest.post('/song').send({
        name: "",
        artist: artist
    })

    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`Invalid input when trying to create  by ${artist}. `)
});

test.only("POST /song fail case with invalid artist", async () => {
    // Create Song
    const { name, artist } = generateSongData();
    const testResponse = await testRequest.post('/song').send({
        name: name,
        artist: ''
    })

    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`Invalid input when trying to create ${name} by . `);
})


test.only("POST /song fail case with closed connection", async () => {
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
    

// READ
test.only("GET /song full list of songs", async () => {
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
    
test.only("GET /song search success case", async () => { 
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
    expect(testResponse.text).toContain(artist)


});

test.only("GET /song search fail case", async () => { 
    // Try and find song that does not exist
    const search = "aaaas"
    const testResponse = await testRequest.get(`/song?searchQuery=${search}`);


    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Could not find song ${search}`)


});

test("GET /song fail case with closed connection", async () => {
    // Create Song
    const { name, artist } = generateSongData();

    model.endConnection();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    });

    // Find Previously Created Song
    const testResponse = await testRequest.get(`/song/show?name=${name}`);


    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toBe(`Can't add new command when connection is in closed state`)


});


// UPDATE
test("PUT /song success case", async () => {
    // Create new Song to test edit
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    // Edit with new name
    const newTitle = "New Title";
    const newYear = artist - 2;

    const testResponse = await testRequest.put('/song/update').send({
        name: name,
        newTitle: newTitle,
        newYear: newYear
    });
    
    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toBe(`Song ${name} was updated successfully with new name: ${newTitle} and new artist: ${newYear}. `);
});


test("PUT /song fail case with invalid new name", async () => {
    // Create new Song to test edit
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    // Edit with invalid new name
    const newTitle = "";
    const newYear = artist - 2;

    const testResponse = await testRequest.put('/song/update').send({
        name: "",
        newTitle: newTitle,
        newYear: newYear
    });
    
    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toBe(`Invalid input when trying to update fields to ${newTitle} and ${newYear}`);
});


test("PUT /song fail case with invalid new artist", async () => {
    // Create new Song to test edit
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    // Edit with invalid new artist
    const newTitle = "New Title";
    const newYear = 3000;

    const testResponse = await testRequest.put('/song/update').send({
        name: name,
        newTitle: newTitle,
        newYear: newYear
    });
    
    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toBe(`Invalid input when trying to update fields to ${newTitle} and ${newYear}`);
});

test("PUT /song fail case with closed connection", async () => {
    // Create new Song to test edit
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    // Edit with invalid new artist
    const newTitle = "New Title";
    const newYear = 2000;

    model.endConnection();

    const testResponse = await testRequest.put('/song/update').send({
        name: name,
        newTitle: newTitle,
        newYear: newYear
    });
    
    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toBe(`Can't add new command when connection is in closed state`);
});



// DELETE
test("DELETE /song success case", async () => {
    // Create new Song to test remove
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })

    // Remove created song
    const testResponse = await testRequest.delete('/song/removal').send({
        name: name,
        artist: artist
    });

    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toBe(`Song ${name} was removed successfully!`);
});

// DELETE
test("DELETE /song fail case", async () => {
    // Create new Song to test remove
    const { name, artist } = generateSongData();
    await testRequest.post('/song').send({
        name: name,
        artist: artist
    })
    model.endConnection();

    // Remove created song
    const testResponse = await testRequest.delete('/song/removal').send({
        name: name,
        artist: artist
    });

    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toBe(`Song ${name} was removed successfully!`);
});




afterEach(async () => {
    model.endConnection();
})