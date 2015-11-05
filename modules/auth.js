var crypt = require("./aescrypt");
var user = require("./user");
var templates = require("./templates");


var auth = function (shatserver){
  auth.shatserver = shatserver;
};

auth.generateRandomMessage = function(){
    return Math.random().toString(36).substring(7);
};

auth.check_auth = function(socket, data, ip){
    var random_message = auth.generateRandomMessage();
    var message = crypt.encrypt(JSON.stringify({connection: {ip: ip,message: crypt.encrypt(random_message)}}))+"\n";
    socket.write(message);
    return random_message
};

auth.second_handshake = function (socket, data, private_key){
    console.log(JSON.parse(data));
    var json = JSON.parse(data);
    if (json.connection != undefined &&
        json.connection.message != undefined &&
        json.connection.message == auth.shatserver.get_user(private_key).verify_key)
    {
        auth.shatserver.logged_clients[auth.shatserver.get_user_id(private_key)].verified = true;
        auth.shatserver.logged_clients[auth.shatserver.get_user_id(private_key)].login =  JSON.parse(data).connection.login;
        var message = crypt.encrypt(JSON.stringify(auth.shatserver.get_users_json()))+"\n";
        socket.write(message);
        console.log("second handshake done");
    }
    else{
        socket.write(templates.error(2));
    }
};

auth.first_handshake = function(socket, data, private_key, ip){
    var random_message = auth.check_auth(socket, data, private_key);
    var login = JSON.parse(data).connection.login;
    if (random_message != undefined) {
        auth.shatserver.logged_clients.push(new user(login, auth.shatserver.logged_clients.length, ip, random_message, private_key, socket));
    }
    else if (debug)
        console.error("Auth check failed for %s", ip);
};

auth.check_user_status = function(private_key){
    console.log("logged_clients : %s", auth.shatserver.logged_clients.length);
    if (private_key != undefined) {
        var found_user = auth.shatserver.get_user(private_key);
        if (found_user != undefined) {
            if (private_key == found_user.private_key) {
                if (found_user.verified)
                    return 2;
                return 1
            }
        }
        return 0;
    }
    return -1;
};

auth.is_blacklisted = function (ip){
    return false;
};

module.exports = auth;