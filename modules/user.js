var user = function(login, id, ip, verify_key, private_key, socket){
    this.login = login;
    this.ip = ip;
    this.id = id;
    this.verified = false;
    this.verify_key = verify_key;
    this.private_key = private_key;
    this.socket = socket;
};

user.initiatePing = function(userObject){
    userObject.refreshIntervalId = setInterval(function(){user.ping(userObject)}, 10000);
};

user.ping = function (user){
    console.log("Pinged %s", user.private_key);
    var pingMessage = JSON.stringify({ping:{message: "ARE U STILL THERE ?"}}) + "\n";
    console.log(user);
    user.socket.write(pingMessage);
};

module.exports = user;