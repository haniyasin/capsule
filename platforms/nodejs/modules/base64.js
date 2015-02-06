//a wrapper module  around buffer base64 encoding and decoding capabilities

exports.encode = function(string){
    return new Buffer(string).toString('base64');  
};

exports.decode =  function(encoded_string){
    return new Buffer(encoded_string, 'base64').toString('utf8');
};