/*
 * low level storage module for nodejs 
 * API is async
 */
var fs = require('fs');

/*
 * getting stat info about object by id
 */

exports.stat = function(id, cb,capsule){
    fs.stat(id, cb);  
}
/*
 * deleting object by id
 */

exports.delete = function(id, cb, capsule){
    fs.unlink(id, cb);   
}

/*
 * writing to object by id. Writing only as appending
 */
exports.append = function(id, data, cb, capsule){
    fs.appendFile(id, data, cb);
}

/*
 * reading object by id
 */

exports.read = function(id, cb, capsule){
    fs.readFile(id, cb)
}