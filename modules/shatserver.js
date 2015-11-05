/**
 * Created by lupin on 03/11/15.
 */
var config = require("../config");
var crypt = require("./aescrypt");
var templates = require("./templates");
var auth = require("./auth");
var net = require('net');

var shatserver = function(){
    shatserver.auth = auth(shatserver);
    shatserver.logged_clients = [];
    shatserver.server = net.createServer();
    shatserver.server.listen(config.port);
    shatserver.server.on('connection', function(socket) {
        if (config.debug)
            console.log("%s connected", socket.remoteAddress);
        shatserver.socket_handler(socket, socket.remoteAddress);
    });
    if (config.debug)
        console.log("Server listening on %s:%d", config.ip, config.port);
};

shatserver.socket_handler = function(socket, ip){
    socket.on('data', function(data){
        console.log("Raw Data : [%s]", data.toString('utf-8'));
        var deciphered_data = crypt.decrypt(data.toString('utf-8')).toString('utf-8');
        console.log("Decyphered Data : [%s]", deciphered_data);
        //IF not logged in already AND is not blacklisted
        try {
            var private_key = JSON.parse(deciphered_data).private_key;
        }
        catch (e){
            console.error("Unable to parse [%s] from %s", deciphered_data, ip);
            return;
        }
        switch (auth.check_user_status(private_key)){
            case -1:
                console.warn("user with ip %s did not provide a private key", ip);
                socket.write(templates.error(1));
                break;
            case 0:
                console.warn("private_key %s is unknown", private_key);
                auth.first_handshake(socket, deciphered_data, private_key, ip);
                break;
            case 1:
                console.warn("private_key %s is not validated", private_key);
                auth.second_handshake(socket, deciphered_data, private_key);
                break;
            case 2:
                console.warn("private_key %s is validated", private_key);
                shatserver.handle_message(socket, deciphered_data);
        }
    });
};

shatserver.handle_message = function(socket, data){
    var private_key;
    var user;
    if ((private_key = (JSON.parse(data).private_key)) == undefined) {
        console.warn("User with ip %s have not provided a private key", socket.remoteAddress);
        return;
    }
    if ((user = shatserver.get_user(private_key)) == undefined){
        console.error("User with ip %s and private_key %s is not logged", socket.remoteAddress, private_key);
        return;
    }
    switch (shatserver.get_message_type(data)){
        case 0:
            user.logout(private_key);
    }
    socket.write(crypt.encrypt(JSON.stringify({message: "what's up ?"}))+"\n");
};

shatserver.get_message_type = function(data){
    var jsonMessage = JSON.parse(data);
    if (jsonMessage.logout != undefined)
        return 0;
};

shatserver.is_login_available = function(login){
    users = shatserver.get_users_json();
    for (var i = 0;i < users; i++)
	if (login == users[i].login)
	    return true;
    return false;
}

shatserver.get_users_json = function(){
    var finalMessage = [];
    for (var i = 0; i < shatserver.logged_clients.length; i++) {
        finalMessage.push({login: shatserver.logged_clients[i].login, ip: shatserver.logged_clients[i].ip});
    }
    return finalMessage
};

shatserver.get_user_id = function(private_key){
    var user = shatserver.get_user(private_key);
    if (user != undefined)
        return user.id;
    return -1;
};

shatserver.get_user = function(private_key){
    for (var i = 0; i < shatserver.logged_clients.length; i++){
        if (private_key == shatserver.logged_clients[i].private_key){
            return shatserver.logged_clients[i];
        }
    }
    return undefined;
};


module.exports = shatserver;