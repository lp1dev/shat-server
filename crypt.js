var exports = module.exports = {};

exports.passphrase="";

exports.crypto = require('crypto');
exports.algorithm = 'aes-256-ctr';

exports.encrypt = function(text) {
    var cipher = exports.crypto.createCipher(exports.algorithm, exports.passphrase);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

exports.decrypt = function(text) {
    var result,
	encoded   = new Buffer(text, 'base64'),
	decodeKey = exports.crypto.createHash('sha256').update(exports.passphrase, 'ascii').digest();
	decipher  = exports.crypto.createDecipheriv('aes-256-ctr', decodeKey, '1234567890123456');
    	console.log(exports.passphrase);
    result = decipher.update(encoded);
    result += decipher.final();
    return result;
}
