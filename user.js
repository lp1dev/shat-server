var User = module.exports = {};

User.create = function(ip){
    User.login = "";
    User.ip = ip;
    User.verified = false;
    User.verify_key = "";
    return this;
}