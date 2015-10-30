var net = require('net');
var crypt = require("./crypt");

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

function handshake(socket){
    var random_message = generateRandomMessage();
    var message = crypt.encrypt(JSON.stringify({hello: socket.remoteAddress ,message: crypt.encrypt(random_message)}))+"\n";
    console.log(message);
    socket.write(message);
//    answer = socket.read(1024);
}

function is_logged(ip){
    return true;
}

function socket_handler(socket){
    socket.on('data', function(data){
	console.log("Raw Data : [%s]", data.toString('utf-8'));
	console.log("Decyphered Data : [%s]", crypt.decrypt(data.toString('utf-8')).toString('utf-8'));
	//IF not logged in already AND is not blacklisted
	handshake(socket);
    });
}

server.listen(port);
console.log("Server listening on %s:%d", ip, port);
server.on('connection', function(socket) {
    if (debug)
	console.log("%s connected", socket.remoteAddress);
    socket_handler(socket);
});

