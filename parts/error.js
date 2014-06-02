/*
 * common error object, used as standart envelope for any errors or exceptions in functions, callbacks or 
 * services
 */

module.exports = function(name, msg){
    this.name = name;
    this.msg = msg;
}