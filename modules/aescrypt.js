var aescrypt = module.exports = {};
var crypto = require('crypto');
var config = require("../config");

aescrypt.decrypt = function(encryptdata) {
    try{
	var encoded = new Buffer(encryptdata, 'base64');
	var cipheredkey = crypto.createHash('sha256').update(config.passphrase).digest();
	var decipher = crypto.createDecipheriv('aes-256-ctr', cipheredkey, config.iv);
	return Buffer.concat([
	    decipher.update(encoded),
	    decipher.final()
	]);
    }
    catch(e){
		console.log(e.stack);
		return "decrypt error";
    }
};

aescrypt.encrypt = function(cleardata) {
    var encipher = crypto.createCipheriv('aes-256-ctr', crypto.createHash('sha256').update(config.passphrase).digest(), config.iv);
    return Buffer.concat([
	encipher.update(cleardata),
	encipher.final()
    ]).toString('base64');
};
