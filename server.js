var net = require('net'),
    JsonSocket = require('json-socket');

var port = 8000;
var server = net.createServer();
server.listen(port);
server.on('connection', function(socket) { //This is a standard net.Socket
    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket

    socket._onData = function(data){
        console.log(data);
    };

    socket.on('message', function(msg, rinfo) {
        console.log('Received %d bytes from %s:%d\n',
            msg.length, rinfo.address, rinfo.port);
    });
});

