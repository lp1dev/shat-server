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
    console.log(message);
    var newUser = new user.create(socket.remoteAddress);
    newUser.verify_key = random_message;
    logged_clients.push(newUser);
}

function second_handshake(socket, data){
    var message = "Cool\n";
    if (JSON.parse(crypt.decrypt(data)).message == get_user(socket.remoteAddress).message)
        socket.write(message);
}

function get_user(ip){
    for (var i = 0; i < logged_clients.length; i++){
        if (ip == logged_clients[i].ip)
            return logged_clients[i];
        }
        return undefined;
    }

function check_user_status(ip){
    console.log("logged_clients = %s", logged_clients.length)
    for (var i = 0 ; i < logged_clients.length; i++){
        console.log("logged_client[%d] = %s", i, logged_clients[i].verify_key);
        if (ip == logged_clients[i].ip) {
            if (logged_clients[i].verified)
                return 2;
            else
                return 1
        }
    }
    return 0;
}

function handle_message(socket, data){
}

function socket_handler(socket, ip){
    socket.on('data', function(data){
	console.log("Raw Data : [%s]", data.toString('utf-8'));
	console.log("Decyphered Data : [%s]", crypt.decrypt(data.toString('utf-8')).toString('utf-8'));
	//IF not logged in already AND is not blacklisted
        switch (check_user_status()){
            case 0:
                console.log("IP %s is unknown", ip);
                first_handshake(socket, data);
                break;
            case 1:
                console.log("IP %s is not validated", ip);
                second_handshake(socket, data);
                break;
            case 2:
                console.log("IP %s is validated", ip);
                handle_message(socket, data);

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

