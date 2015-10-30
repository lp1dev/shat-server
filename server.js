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

function socket_handler(socket){
    socket.on('data', function(data){
	console.log("Raw Data : [%s]", data.toString('utf-8'));
	console.log("Decyphered Data : [%s]", crypt.decrypt(data.toString('utf-8')).toString('utf-8'));
    });
}

server.listen(port);
console.log("Server listening on %s:%d", ip, port);
server.on('connection', function(socket) {
    if (debug)
	console.log("%s connected", socket.remoteAddress);
    socket_handler(socket);
});

