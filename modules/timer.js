var error = require('../../parts/error.js');

exports.create = function(callback, milisec, cyclic){
    if(typeof(setInterval) == 'undefined'
       &&typeof(setTimeout) == 'undefined')
	return new error('not supported', 'this platform is not supported timer functionality');
 
    return {
	id : cyclic ? setInterval(callback, milisec) : setTimeout(callback, milisec),
	destroy : function(){
	    cyclic ? clearInterval(this.id) : clearTimeout(this.id);
	}
    };
}