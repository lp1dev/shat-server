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
    var json = JSON.parse(data);
    if ((private_key = (json.private_key)) == undefined) {
        console.warn("User with ip %s have not provided a private key", socket.remoteAddress);
        return;
    }
    if ((user = shatserver.get_user(private_key)) == undefined){
        console.error("User with ip %s and private_key %s is not logged", socket.remoteAddress, private_key);
        return;
    }
    switch (shatserver.get_message_type(data)){
        case 0:
            shatserver.logout(private_key);
            break;
        case 1:
            shatserver.initiate_connection(data);
            break;
    }
    socket.write(crypt.encrypt(JSON.stringify({message: "what's up ?"}))+"\n");
};

shatserver.initiate_connection = function(data){
    var jsonMessage = JSON.parse(data);
    var nickname;
    var user1 = shatserver.get_user(jsonMessage.private_key);
    var user2;
    if ((nickname = jsonMessage.initiate_chat.nickname) != undefined) {
        if ((user2 = shatserver.get_user_by_login(nickname)) != undefined)
            user2.socket.write(templates.message(0), user1.login, user1.ip);
    }
};

shatserver.get_message_type = function(data){
    var jsonMessage = JSON.parse(data);
    if (jsonMessage.logout != undefined)
        return 0;
    if (jsonMessage.initiate_chat != undefined)
        return 1;
};

shatserver.is_login_available = function(login){
    for (var i = 0;i < shatserver.logged_clients.length; i++){
	if (login == shatserver.logged_clients[i].login)
	    return false;
    }
    return true;
};

shatserver.logout = function(private_key){
    var user = shatserver.get_user(private_key);
    if (user.id >= 0)
	shatserver.logged_clients.splice(user.id, 1);
};

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

shatserver.get_user_by_login = function(login){
    for (var i = 0; i < shatserver.logged_clients.length; i++){
        if (login == shatserver.logged_clients[i].login){
            return shatserver.logged_clients[i];
        }
    }
    return undefined;
};

module.exports = shatserver;