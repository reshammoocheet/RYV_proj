// const app = require('../app');
// const supertest = require("supertest");
// const testRequest = supertest(app);

// /* Data to be used to generate random user for testing */
// const userData = [
// { username: 'vathusan', password: "AsdndA21*@"},
// { username: 'yorick1125', password: "AsdndA21*@" },
// { username: 'resham222', password: "AsdndA21*@" },
// { username: 'talib123', password: "AsdndA21*@"},
// { username: 'webprog22', password: "AsdndA21*@" },
// ]

// /** Since a User can only be added to the DB once, we have to splice from the array. */
// //const generateUserData = () => userData.splice(Math.floor((Math.random() * userData.length)), 1)[0];

// // Slice version - Allows many tests without ever "running out" of generated user
// const generateUserData = () => {
//     const index = Math.floor((Math.random() * userData.length));
//     return userData.slice(index, index+1)[0];
// }

// // Initialize database before proceeding
// const dbName = "music_db_test";
// const model = require('../models/user-model');

// const { test, expect } = require('@jest/globals');
// const { sessionManager } = require('../sessionManager');

// /* Make sure the database is empty before each test.  This runs before each test.  See https://jestjs.io/docs/api */
// beforeEach(async () => {
//     try {
//         await model.initialize(dbName, true);
//      } 
//     catch (err) {
//         console.error(err);
//     }
// });

// // CREATE
// test("POST /register success case", async () => {
//     // Create User
//     const { username, password } = generateUserData();
//     const testResponse = await testRequest.post('/register').send({
//         username: username,
//         password: password
//     })
//     const loginResponse = await testRequest.post('/login').send({
//         username:username,
//         password:password})

//     expect(loginResponse.status).toBe(302);
// });


// test("POST /register fail case with invalid password", async () => {
//     // Create User
//     const { username, password } = generateUserData();
//     const testResponse = await testRequest.post('/register').send({
//         username: username,
//         password: 'aaaaaaa'
//     })
//     const loginResponse = await testRequest.post('/login').send({
//         username:username,
//         password:password})
//     expect(loginResponse.status).toBe(200);
//     expect(loginResponse.text).toContain(`Password not strong enough. `);
// })


// test("POST /register fail case with closed connection", async () => {
//     // Create User
//     const { username, password } = generateUserData();

//     model.endConnection();
    
//     const testResponse = await testRequest.post('/register').send({
//         username: username,
//         password: password
//     })

//     expect(testResponse.status).toBe(500);
//     expect(testResponse.text).toContain(`add new command when connection is in closed state`);
// });
    
// // UPDATE
// test("POST /user-edit success case", async () => {
//     // Create new User to test edit
//     const { username, password } = generateUserData();
//     await testRequest.post('/register').send({
//         username: username,
//         password: password
//     })
//     const loginResponse = await testRequest.post('/login').send({
//         username:username,
//         password:password})

    
//     // Edit with new username
//     const newUsername = "New Username";
//     const newPassword = "new Password";

//     const testResponse = await testRequest.post('/user-edit').send({
//         currentUsername: username,
//         newUsername: newUsername,
//         newPassword: newPassword
//     });
    
//     expect(testResponse.status).toBe(200);
//     expect(testResponse.text).toContain(`User ${username} was updated successfully with new username: ${newUsername} and new password: ${newPassword}. `);
// });


// test("POST /user-edit fail case with invalid new username", async () => {
//     // Create new User to test edit
//     const { username, password } = generateUserData();
//     await testRequest.post('/register').send({
//         username: username,
//         password: password
//     })

//     // Edit with invalid new username
//     const newUsername = "";
//     const newPassword = "new Password";

//     const testResponse = await testRequest.post('/user-edit').send({
//         currentUsername: "",
//         newUsername: newUsername,
//         newPassword: newPassword
//     });
    
//     expect(testResponse.status).toBe(400);
//     expect(testResponse.text).toContain(`Invalid input when trying to update fields to ${newUsername} and ${newPassword}`);
// });


// test("POST /user-edit fail case with invalid new password", async () => {
//     // Create new User to test edit
//     const { username, password } = generateUserData();
//     await testRequest.post('/register').send({
//         username: username,
//         password: password
//     })

//     // Edit with invalid new password
//     const newUsername = "New Username";
//     const newPassword = "";

//     const testResponse = await testRequest.post('/user-edit').send({
//         currentUsername: username,
//         newUsername: newUsername,
//         newPassword: newPassword
//     });

    
    
//     expect(testResponse.status).toBe(400);
//     expect(testResponse.text).toContain(`Invalid input when trying to update fields to ${newUsername} and ${newPassword}`);
// });

// test("POST /user-edit fail case with closed connection", async () => {
//     // Create new User to test edit
//     const { username, password } = generateUserData();
//     await testRequest.post('/register').send({
//         username: username,
//         password: password
//     })

//     // Edit with invalid new password
//     const newUsername = "New Username";
//     const newPassword = "new Password";

//     model.endConnection();

//     const testResponse = await testRequest.post('/user-edit').send({
//         currentUsername: username,
//         newUsername: newUsername,
//         newPassword: newPassword
//     });
    
//     expect(testResponse.status).toBe(500);
//     expect(testResponse.text).toContain(`add new command when connection is in closed state`);
// });


// afterEach(async () => {
//     sessionManager.DEBUG = false;
//     model.endConnection();
// })