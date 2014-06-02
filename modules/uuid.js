var _uuid;
if(typeof(window) == 'object' && typeof(navigator) == 'object') //trying to detect what we inside browser
    _uuid = uuid;
else
    _uuid = require('../dependencies/uuid.js');

exports.generate_str = function(){
    return _uuid.v1();
}

exports.generate_bin = function(){
    var uuid_b = new Array(16);
    _uuid.v1(null, uuid_b, 0);
    return uuid_b;
}

exports.parse = function(UUID_string){
    return _uuid.parse(UUID_string);
}

exports.unparse = function(buffer){
    return _uuid.unparse(buffer);
}

exports.validate = function(UUID){
    
}