var net = require('net');
var crypt = require("./crypt");

//Config
var ip = "0.0.0.0";
var port = 8000;
var debug = true
var server = net.createServer();

crypt.passphrase = "this is a passphrase";

//test

console.log(crypt.decrypt(crypt.encrypt("test42 : Ok")));

function socket_handler(socket){
    socket.on('data', function(data){
	console.log("Raw Data : [%s]", data.toString());
	console.log("Decyphered Data : [%s]", crypt.decrypt(data.toString('utf-8')));
    });
}

server.listen(port);
console.log("Server listening on %s:%d", ip, port);
server.on('connection', function(socket) {
    if (debug)
	console.log("%s connected", socket.remoteAddress);
    socket_handler(socket);
});

