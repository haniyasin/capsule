var _uuid;
if(typeof(module) != 'undefined')  
    _uuid = require('node-uuid');
else if(window.uuid)
    _uuid = uuid;

exports.generate_str = function(){
    return uuid.v1();
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