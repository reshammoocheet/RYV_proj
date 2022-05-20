// Each session contains the username of the user and the time at which it expires
//  This object can be extended to store additional protected session information
class Session {
    /**
     * Represents a session
     * @constructor
     * @param {string} username 
     * @param {Date} expiresAt 
     */
    constructor(username, expiresAt) {
        this.username = username
        this.expiresAt = expiresAt
    }
    // We'll use this method later to determine if the session has expired
    /**
     * Verifies if session has expired
     */
    isExpired() {
        this.expiresAt < (new Date())
    }
}

module.exports = {
    Session
}