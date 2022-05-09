const uuid = require('uuid');
const { Session } = require('./session');
// Each session contains the username of the user and the time at which it expires
//  This object can be extended to store additional protected session information
class SessionManager {
    constructor(){
        this.sessions = {};
        this.currentUser = {};
    }

    createSession(username, numMinutes) {
        // Generate a random UUID as the sessionId
        const sessionId = uuid.v4()
        // Set the expiry time as numMinutes (in milliseconds) after the current time
        const expiresAt = new Date(Date.now() + numMinutes * 60000);
    
        // Create a session object containing information about the user and expiry time
        const thisSession = new Session(username, expiresAt);
        
        // Add the session information to the sessions map, using sessionId as the key
        this.sessions[sessionId] = thisSession;
        return sessionId;
    }

    authenticateUser(request) {
        // If this request doesn't have any cookies, that means it isn't authenticated. Return null.
        if (!request.cookies) {
            return null;
        }
        // We can obtain the session token from the requests cookies, which come with every request
        const sessionId = request.cookies['sessionId']
        if (!sessionId) {
            // If the cookie is not set, return null
            return null;
        }
        // We then get the session of the user from our session map
        var userSession = this.sessions[sessionId]
        if (!userSession) {
            return null;
        }        // If the session has expired, delete the session from our map and return null
        if (userSession.isExpired()) {
            delete this.sessions[sessionId];
            return null;
        }
        return { sessionId, userSession }; // Successfully validated.
    }

    refreshSession(request, response){
        const authenticatedSession = authenticateUser(request);
        if (!authenticatedSession) {
            response.sendStatus(401); // Unauthorized access
            return;
        }
        // Create and store a new Session object that will expire in 2 minutes.
        const newSessionId = createSession(authenticatedSession.userSession.username, 2);
        // Delete the old entry in the session map 
        delete this.sessions[authenticatedSession.sessionId];
        
        // Set the session cookie to the new id we generated, with a
        // renewed expiration time
        response.cookie("sessionId", newSessionId, { expires: this.sessions[newSessionId].expiresAt })
        return newSessionId;
    
    }
}

const sessionManager = new SessionManager();

module.exports = {
    SessionManager,
    sessionManager
}