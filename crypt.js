var crypto = require('crypto');

var AESCrypt = module.exports = {};

AESCrypt.passphrase = "";
AESCrypt.iv = "";

AESCrypt.decrypt = function(encryptdata) {
    var decipher = crypto.createDecipheriv('aes-256-ctr', crypto.createHash('sha256').update(AESCrypt.passphrase).digest(), AESCrypt.iv);
    return Buffer.concat([
	decipher.update(encryptdata),
	decipher.final()
    ]);
}

AESCrypt.encrypt = function(cleardata) {
    var encipher = crypto.createCipheriv('aes-256-ctr', crypto.createHash('sha256').update(AESCrypt.passphrase).digest(), AESCrypt.iv);
    return Buffer.concat([
	encipher.update(cleardata),
	encipher.final()
    ]);
}
