const validator = require('validator');

function isValid(name, artist){ 
    return validText(name) && validText(artist);
}

function validText(text){
    // if title is type string and is alphabetic characters
    return typeof text === "string" && !isEmpty(text);
}


function isEmpty(s){
    return s === "" || s === " " || !s
}

module.exports = {
    isValid
}