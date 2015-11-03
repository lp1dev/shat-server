var net = require('net');
var crypt = require('./modules/aescrypt');
var user = require("./modules/user");
var auth = require("./modules/auth");
var config = require("./config");

var server = net.createServer();

/* Temporary Encryption test
var test_message = "Encryption Test is OK";
var encoded_message = crypt.encrypt(test_message);
console.log(crypt.decrypt(encoded_message).toString('utf-8'));
*/

var logged_clients = [];

function first_handshake(socket, data, private_key, ip){
    var random_message = auth.check_auth(socket, data, private_key);
    if (random_message != undefined) {
        logged_clients.push(new user(logged_clients.length, ip, random_message, private_key, socket));
    }
    else if (debug)
        console.error("Auth check failed for %s", ip);
}

function get_users_json(){
    var finalMessage = [];
    for (var i = 0; i < logged_clients.length; i++){
        finalMessage.push({"login":logged_clients[i].login});
    }
    return finalMessage
}

function second_handshake(socket, data, private_key){
    console.log(data);
    console.log(get_user(private_key).verify_key);
    console.log(JSON.parse(data));
    console.log(JSON.parse(data).connection.message);
    var json = JSON.parse(data);
    if (json.connection.message == get_user(private_key).verify_key){
	logged_clients[get_user_id(private_key)].verified = true;
	logged_clients[get_user_id(private_key)].login =  JSON.parse(data).connection.login;
	var message = crypt.encrypt(JSON.stringify(get_users_json()))+"\n";
	socket.write(message);
	console.log("second handshake done");
}
}

function get_user_id(private_key){
    var user = get_user(private_key);
    if (user != undefined)
	    return user.id;
    return -1;
}

function get_user(private_key){
    console.log("get user length : %d", logged_clients.length);
    for (var i = 0; i < logged_clients.length; i++){
	console.log("user %d : %s", i, logged_clients[i].private_key);
	console.log("comparing %s with %s", private_key, logged_clients[i].private_key);
        if (private_key == logged_clients[i].private_key){
            return logged_clients[i];
	    }
    }
    return undefined;
}

function check_user_status(private_key){
    console.log("logged_clients = %s", logged_clients.length)
    var found_user = get_user(private_key);
    console.log("Found User = %s", found_user);
    if (found_user != undefined){
        if (private_key == found_user.private_key) {
            if (found_user.verified)
                return 2;
            return 1
        }
    }
    return 0;
}

function get_message_type(data){
    var jsonMessage = JSON.parse(data);
    if (jsonMessage.logout)
        return 0;
}

function logout(private_key){
    var user_id = get_user_id(private_key);
    if (user_id >= 0)
       logged_clients.splice(user_id, 1);
}

function handle_message(socket, data){
    switch (get_message_type(data)){
        case 0:
            logout(JSON.parse(data).private_key)
    }
    socket.write(crypt.encrypt("OK")+"\n");
}

function socket_handler(socket, ip){
    socket.on('data', function(data){
	console.log("Raw Data : [%s]", data.toString('utf-8'));
	var decyphered_data = crypt.decrypt(data.toString('utf-8')).toString('utf-8');
	console.log("Decyphered Data : [%s]", decyphered_data);
	//IF not logged in already AND is not blacklisted
        var private_key = JSON.parse(decyphered_data).private_key;
        switch (check_user_status(private_key)){
            case 0:
                console.warn("private_key %s is unknown", private_key);
                first_handshake(socket, decyphered_data, private_key, ip);
                break;
            case 1:
                console.warn("private_key %s is not validated", private_key);
                second_handshake(socket, decyphered_data, private_key);
                break;
            case 2:
                console.warn("private_key %s is validated", private_key);
                handle_message(socket, decyphered_data);
        }
    });
}

server.listen(config.port);
console.log("Server listening on %s:%d", config.ip, config.port);
server.on('connection', function(socket) {
    if (config.debug)
	    console.log("%s connected", socket.remoteAddress);
    socket_handler(socket, socket.remoteAddress);
});