/**
 * Created by lupin on 04/11/15.
 */
var net = require('net');
var crypt = require('./modules/aescrypt');
var port = 8080;
var host = "127.0.0.1";
var socket = net.createConnection(port, host);
console.log('Socket created.');
socket.on('data', function(data) {
    var deciphered = crypt.decrypt(data.toString().replace("\n", ""));
    var json = JSON.parse(deciphered);
    if (json.connection)
	socket.write(crypt.encrypt(JSON.stringify(
	    {
		    connection:{message:crypt.decrypt(json.connection.message).toString()},
            private_key:"42"
	    })));
    console.log('RESPONSE: ' + deciphered);
}).on('connect', function() {
    socket.write(crypt.encrypt('{"hello":"lp1.eu"}'));
    socket.write(crypt.encrypt('{"hello":"lp1.eu", "private_key":"42"}'));
}).on('end', function() {
    console.log('DONE');
});
