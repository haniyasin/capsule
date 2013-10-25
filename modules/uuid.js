var uuid = require('node-uuid');

exports.generate_str = function(){
    return uuid.v1();
}

exports.generate_bin = function(){
    var uuid_b = new Array(16);
    uuid.v1(null, uuid_b, 0);
    return uuid_b;
}

exports.parse = function(UUID_string){
    return uuid.parse(UUID_string)
}

exports.unparse = function(buffer){
    return uuid.unparse(buffer);
}

exports.validate = function(UUID){
    
}