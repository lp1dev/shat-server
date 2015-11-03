var crypt = require("./aescrypt");
var auth = module.exports = {};

auth.generateRandomMessage = function(){
    return Math.random().toString(36).substring(7);
};

auth.check_auth = function (socket, data, ip){
    var random_message = auth.generateRandomMessage();
    var message = crypt.encrypt(JSON.stringify({hello: ip,message: crypt.encrypt(random_message)}))+"\n";
    socket.write(message);
    return random_message
};

auth.is_blacklisted = function (ip){
    return false;
};