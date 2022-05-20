const validator = require('validator');
/**
 * Validates the name and artist variables
 * @param {*} name 
 * @param {*} artist 
 * @returns {boolean} whether both parameters are valid
 */
function isValid(name, artist){ 
    return validText(name) && validText(artist);
}
/**
 * Validates if the passed in variable is a string and is not empty
 * @param {*} text 
 * @returns {boolean} whether the parameter is valid
 */
function validText(text){
    // if title is type string and is alphabetic characters
    return typeof text === "string" && !isEmpty(text);
}

/**
 * Verifies if the variable is empty
 * @param {string} s 
 * @returns {boolean} whether the variable is empty
 */
function isEmpty(s){
    return s === "" || s === " " || !s
}

module.exports = {
    isValid
}