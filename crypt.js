var crypto = require('crypto');

var AESCrypt = module.exports = {};

AESCrypt.passphrase = "";
AESCrypt.iv = "";

AESCrypt.decrypt = function(encryptdata) {
    try{
	encoded = new Buffer(encryptdata, 'base64');
	var cipheredkey = crypto.createHash('sha256').update(AESCrypt.passphrase).digest();
	var decipher = crypto.createDecipheriv('aes-256-ctr', cipheredkey, AESCrypt.iv);
	return Buffer.concat([
	    decipher.update(encoded),
	    decipher.final()
	]);
    }
    catch(e){
	console.log(e.stack);
	return "";
    }
}

AESCrypt.encrypt = function(cleardata) {
    var encipher = crypto.createCipheriv('aes-256-ctr', crypto.createHash('sha256').update(AESCrypt.passphrase).digest(), AESCrypt.iv);
    return Buffer.concat([
	encipher.update(cleardata),
	encipher.final()
    ]).toString('base64');
}
