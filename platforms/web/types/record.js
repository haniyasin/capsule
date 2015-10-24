/*
 * record like a object which is consist of simple values(JSON) with builtin versioning
 */

function record(_record){
    this.version = 0;
    this.data = {
    };
}

record.prototype = {
    update : function(){
	this.version++;
	
    }    
};

module.exports = record;