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
    var decipher = exports.crypto.createDecipher(exports.algorithm, exports.passphrase);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}
