var net = require('net');

var ip = "0.0.0.0";
var port = 8000;
var debug = true
var server = net.createServer();

function socket_handler(socket){
    socket.on('data', function(data){
	console.log(data.toString());
    });
}

server.listen(port);
console.log("Server listening on %s:%d", ip, port);
server.on('connection', function(socket) {
    if (debug)
	console.log("%s connected", socket.remoteAddress);
    socket_handler(socket);
});
