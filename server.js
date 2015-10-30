var net = require('net');
var crypt = require("./crypt");
var user = require("./user");

//Config
var ip = "0.0.0.0";
var port = 80;
var debug = true
var server = net.createServer();

crypt.passphrase = "this is a passphrase";
crypt.iv = "1234567890123456";

var test_message = "Test is OK";
var encoded_message = crypt.encrypt(test_message);
console.log(crypt.decrypt(encoded_message).toString('utf-8'));
var logged_clients = [];

function generateRandomMessage(){
    return Math.random().toString(36).substring(7);
}

function first_handshake(socket, data){
    var random_message = generateRandomMessage();
    var message = crypt.encrypt(JSON.stringify({hello: socket.remoteAddress ,message: crypt.encrypt(random_message)}))+"\n";
    socket.write(message);
    var newUser = new user.create(socket.remoteAddress);
    newUser.verify_key = random_message;
    newUser.ip = socket.remoteAddress;
    newUser.id = logged_clients.length;
    logged_clients.push(newUser);
}

function second_handshake(socket, data){
    var ip = socket.remoteAddress;
    console.log(data);
    console.log(get_user(socket.remoteAddress).verify_key);
    console.log(JSON.parse(data));
    console.log(JSON.parse(data).connection.message);
    var json = JSON.parse(data);
    if (json.connection.message == get_user(socket.remoteAddress).verify_key){
	logged_clients[get_user_id(ip)].verified = true;
	logged_clients[get_user_id(ip)].login =  JSON.parse(data).connection.login;
	var message = crypt.encrypt(JSON.stringify(logged_clients))+"\n";
	socket.write(message);
	console.log("second handshake done");
}
}

function get_user_id(ip){
    var user = get_user(ip);
    if (user != undefined)
	return user.id;
    return -1;
}

function get_user(ip){
    console.log("get user length : %d", logged_clients.length); 
    
    for (var i = 0; i < logged_clients.length; i++){
	console.log("user %d : %s", i, logged_clients[i].ip);
	console.log("comparing %s with %s", ip, logged_clients[i].ip);
        if (ip == logged_clients[i].ip){
            return logged_clients[i];
	}
    }
    return undefined;
}

function check_user_status(ip){
    console.log("logged_clients = %s", logged_clients.length)
    var found_user = get_user(ip);
    if (found_user != undefined){
        if (ip == found_user.ip) {
            if (found_user.verified)
                return 2;
            else
                return 1
        }
    }
    return 0;
}

function handle_message(socket, data){
    socket.write(crypt.encrypt("OK")+"\n");
}

function socket_handler(socket, ip){
    socket.on('data', function(data){
	console.log("Raw Data : [%s]", data.toString('utf-8'));
	var decyphered_data = crypt.decrypt(data.toString('utf-8')).toString('utf-8');
	console.log("Decyphered Data : [%s]", decyphered_data);
	//IF not logged in already AND is not blacklisted
        switch (check_user_status(ip)){
            case 0:
                console.log("IP %s is unknown", ip);
                first_handshake(socket, decyphered_data);
                break;
            case 1:
                console.log("IP %s is not validated", ip);
                second_handshake(socket, decyphered_data);
                break;
            case 2:
                console.log("IP %s is validated", ip);
                handle_message(socket, decyphered_data);
        }
    });
}

server.listen(port);
console.log("Server listening on %s:%d", ip, port);
server.on('connection', function(socket) {
    if (debug)
	    console.log("%s connected", socket.remoteAddress);
    socket_handler(socket, socket.remoteAddress);
});

