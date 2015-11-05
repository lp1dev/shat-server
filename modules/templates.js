/**
 * Created by lupin on 04/11/15.
 */
var templates = module.exports = {};
var crypt = require("./aescrypt");


templates.errors = [,
    {code:1, message: "You must provide a private key"},
    {code:2, message: "Second handshake failed"}
];

templates.messages = {};

templates.error = function(code){
  return crypt.encrypt(JSON.stringify({error:templates.errors[code]}))
};

