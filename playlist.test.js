const app = require('./app');
const supertest = require("supertest");
const testRequest = supertest(app);

/* Data to be used to generate random playlist for testing */
const playlistData = [
{ name: 'Location', description: "Dave"},
{ name: 'Get Busy', description: "Yeat" },
{ name: 'Magnolia', description: "Playboi Carti" },
{ name: 'Jumpman', description: "Drake"},
{ name: 'Low Life', description: "Future" },
]

/** Since a Playlist can only be added to the DB once, we have to splice from the array. */
//const generatePlaylistData = () => playlistData.splice(Math.floor((Math.random() * playlistData.length)), 1)[0];

// Slice version - Allows many tests without ever "running out" of generated playlist
const generatePlaylistData = () => {
    const index = Math.floor((Math.random() * playlistData.length));
    return playlistData.slice(index, index+1)[0];
}

// Initialize database before proceeding
const dbName = "music_db_test";
const model = require('./models/playlist-model');
const playlistPlaylistModel = require('./models/song-model');
const { test, expect } = require('@jest/globals');

/* Make sure the database is empty before each test.  This runs before each test.  See https://jestjs.io/docs/api */
beforeEach(async () => {
    try {
        await model.initialize(dbName, true);
        await playlistPlaylistModel.initialize(dbName, true);
     } 
    catch (err) {
        console.error(err);
    }
});

// CREATE
test("POST /playlist success case", async () => {
    // Create Playlist
    const { name, description } = generatePlaylistData();
    const testResponse = await testRequest.post('/playlist').send({
        name: name,
        description: description
    })

    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Playlist ${name} with description ${description} was created successfully! `)
});

test("POST /playlist fail case with blank name", async () => {
    // Create Playlist
    const { name, description } = generatePlaylistData();
    const testResponse = await testRequest.post('/playlist').send({
        name: "",
        description: description
    })

    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`Invalid input when trying to create  with description ${description}. `)
});


test("POST /playlist fail case with closed connection", async () => {
    // Create Playlist
    const { name, description } = generatePlaylistData();

    model.endConnection();
    
    const testResponse = await testRequest.post('/playlist').send({
        name: name,
        description: description
    })

    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toContain(`add new command when connection is in closed state`);
});
    

// READ
test("GET /playlist full list of playlists", async () => {
    // Fill db with list of playlists
    await testRequest.post('/playlist').send({
        name: "name1",
        description: "description1"
    });

    await testRequest.post('/playlist').send({
        name: "name2",
        description: "description2"
    });

    await testRequest.post('/playlist').send({
        name: "name3",
        description: "description3"
    });



    const testResponse = await testRequest.get('/playlists');
    expect(testResponse.status).toBe(200);
});
    
test("GET /playlist search success case", async () => { 
    // Create Playlist
    const { name, description } = generatePlaylistData();
    await testRequest.post('/playlist').send({
        name: name,
        description: description
    });

    // Find Previously Created Playlist
    const testResponse = await testRequest.get(`/playlist?searchQuery=${name}`);


    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(name)
    expect(testResponse.text).toContain(description)


});

test("GET /playlist search fail case", async () => { 
    // Try and find playlist that does not exist
    const search = "aaaas"
    const testResponse = await testRequest.get(`/playlist?searchQuery=${search}`);


    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Could not find playlist ${search}`)


});

test("GET /playlist fail case with closed connection", async () => {
    // Create Playlist
    const { name, description } = generatePlaylistData();

    model.endConnection();
    await testRequest.post('/playlist').send({
        name: name,
        description: description
    });

    // Find Previously Created Playlist
    const testResponse = await testRequest.get(`/playlist?name=${name}`);


    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toContain(`add new command when connection is in closed state`)


});


// UPDATE
test("PUT /playlist success case", async () => {
    // Create new Playlist to test edit
    const { name, description } = generatePlaylistData();
    await testRequest.post('/playlist').send({
        name: name,
        description: description
    })

    // Edit with new name
    const newName = "New Title";
    const newDescription = "new description";

    const testResponse = await testRequest.post('/playlist-edit').send({
        currentName: name,
        newName: newName,
        newDescription: newDescription
    });
    
    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Playlist ${name} was updated successfully with new name: ${newName} and new description: ${newDescription}. `);
});


test("PUT /playlist fail case with invalid new name", async () => {
    // Create new Playlist to test edit
    const { name, description } = generatePlaylistData();
    await testRequest.post('/playlist').send({
        name: name,
        description: description
    })

    // Edit with invalid new name
    const newName = "";
    const newDescription = "new description";

    const testResponse = await testRequest.post('/playlist-edit').send({
        currentName: "",
        newName: newName,
        newDescription: newDescription
    });
    
    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`Invalid input when trying to update fields to ${newName} and ${newDescription}`);
});


test("PUT /playlist fail case with closed connection", async () => {
    // Create new Playlist to test edit
    const { name, description } = generatePlaylistData();
    await testRequest.post('/playlist').send({
        name: name,
        description: description
    })

    // Edit with invalid new description
    const newName = "New Title";
    const newDescription = "new description";

    model.endConnection();

    const testResponse = await testRequest.post('/playlist-edit').send({
        currentName: name,
        newName: newName,
        newDescription: newDescription
    });
    
    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toContain(`add new command when connection is in closed state`);
});



// DELETE
test("DELETE /playlist success case", async () => {
    // Create new Playlist to test remove
    const { name, description } = generatePlaylistData();
    await testRequest.post('/playlist').send({
        name: name,
        description: description
    })

    const playlist = await model.findByName(name);


    // Remove created playlist
    const testResponse = await testRequest.post('/playlist-delete').send({
        id: playlist[0].id
    });

    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`Playlist was removed successfully!`);
});

// DELETE
test("DELETE /playlist fail case", async () => {
    // Create new Playlist to test remove
    const { name, description } = generatePlaylistData();
    await testRequest.post('/playlist').send({
        name: name,
        description: description
    })

    const playlist = await model.findByName(name);
    model.endConnection();

    // Remove created playlist
    const testResponse = await testRequest.post('/playlist-delete').send({
        id: playlist[0].id
    });

    expect(testResponse.status).toBe(500);
    expect(testResponse.text).toContain(`add new command when connection is in closed state`);
});




afterEach(async () => {
    model.endConnection();
})