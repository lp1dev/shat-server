var config = module.exports = {};

/* Basic Configuration */
config.ip = "0.0.0.0";
config.port = 8080;
config.debug = true;

/* Login rules */
config.login_max_chars = 21;
config.login_min_chars = 3;

/* AES256 Configuration */
config.passphrase = "this is a passphrase";
config.iv = "1234567890123456";