const app = require('../app');
const supertest = require("supertest");
const testRequest = supertest(app);

/* Data to be used to generate random user for testing */
const userData = [
{ username: 'vathusan', password: "Abcd123!"},
{ username: 'yorick1125', password: "Abcd123!" },
{ username: 'resham222', password: "Abcd123!" },
{ username: 'talib123', password: "Abcd123!"},
{ username: 'webprog22', password: "Abcd123!" },
]

/** Since a User can only be added to the DB once, we have to splice from the array. */
//const generateUserData = () => userData.splice(Math.floor((Math.random() * userData.length)), 1)[0];

// Slice version - Allows many tests without ever "running out" of generated user
const generateUserData = () => {
    const index = Math.floor((Math.random() * userData.length));
    return userData.slice(index, index+1)[0];
}

// Initialize database before proceeding
const dbName = "music_db_test";
const model = require('../models/user-model');

const { test, expect } = require('@jest/globals');
const { sessionManager } = require('../sessionManager');

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
test("POST /register success case", async () => {
    // Create User
    const { username, password } = generateUserData();
    const testResponse = await testRequest.post('/register').send({
        username: username,
        password: password
    })
    const loginResponse = await testRequest.post('/login').send({
        username:username,
        password:password})

    expect(loginResponse.status).toBe(302);
});


test("POST /register fail case with invalid password", async () => {
    // Create User
    const { username, password } = generateUserData();
    const testResponse = await testRequest.post('/register').send({
        username: username,
        password: 'aaaaaaa'
    })
    expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`Password was not strong enough.`);
})


test("POST /register fail case with closed connection", async () => {
    // Create User
    const { username, password } = generateUserData();

    model.endConnection();
    
    const testResponse = await testRequest.post('/register').send({
        username: username,
        password: password
    })

    expect(testResponse.status).toBe(500);
});
    
// UPDATE
test("POST /user-edit success case", async () => {
    // Create new User to test edit
    const { username, password } = generateUserData();
    await testRequest.post('/register').send({
        username: username,
        password: password
    })
    // const loginResponse = await testRequest.post('/login').send({
    //     username:username,
    //     password:password})

    
    // Edit with new username
    const newUsername = "username1212";
    const newPassword = "aaaaa";

    const testResponse = await testRequest.post('/user-edit').send({
        currentUsername: username,
        newUsername: newUsername,
        newPassword: newPassword
    });
    
    expect(testResponse.status).toBe(200);
    expect(testResponse.text).toContain(`User ${newUsername} was updated successfully`);
});


test("POST /user-edit fail case with invalid new username", async () => {
    // Create new User to test edit
    const { username, password } = generateUserData();
    await testRequest.post('/register').send({
        username: username,
        password: password
    })

    // Edit with invalid new username
    const newUsername = "";
    const newPassword = "Abcd123!";

    const testResponse = await testRequest.post('/user-edit').send({
        currentUsername: "",
        newUsername: newUsername,
        newPassword: newPassword
    });
    
    //expect(testResponse.status).toBe(400);
    expect(testResponse.text).toContain(`Invalid input when trying to update`);
});



test("POST /user-edit fail case with closed connection", async () => {
    // Create new User to test edit
    const { username, password } = generateUserData();
    await testRequest.post('/register').send({
        username: username,
        password: password
    })

    // Edit with invalid new password
    const newUsername = "username9000";
    const newPassword = "Abcd123!";

    model.endConnection();

    const testResponse = await testRequest.post('/user-edit').send({
        currentUsername: username,
        newUsername: newUsername,
        newPassword: newPassword
    });
    
    expect(testResponse.status).toBe(500);
});


afterEach(async () => {
    sessionManager.DEBUG = false;
    connection = model.getConnection();
    if (connection) {
        //await connection.close();
    } 
})