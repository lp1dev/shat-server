/**
 * Created by lupin on 04/11/15.
 */
var templates = module.exports = {};
var crypt = require("./aescrypt");


templates.errors = [,
    {code:1, message: "You must provide a private key"},
    {code:2, message: "Second handshake failed"},
    {code:3, message: "JSON message must contain a 'connection' field"},
    {code:4, message: "Login is already taken"},
    {code:5, message: "Login is too long or too short"}
];

templates.messages = [
    {chat_request:{nickname:"%s", "ip":"%s"}}
];

templates.error = function(code){
  return crypt.encrypt(JSON.stringify({error:templates.errors[code]}))
};

templates.message = function(code){
    return crypt.encrypt(JSON.stringify(templates.messages[code]));
};

