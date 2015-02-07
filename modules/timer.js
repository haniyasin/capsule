var error = require('parts/error');

exports.create = function(callback, milisec, cyclic){
    if(typeof(setInterval) == 'undefined'
       &&typeof(setTimeout) == 'undefined')
	return new error('not supported', 'this platform is not supported timer functionality');
 
    var id = cyclic ? setInterval(callback, milisec) : setTimeout(callback, milisec);
    return {
	destroy : function(){
	    cyclic ? clearInterval(id) : clearTimeout(id);
	}
    };
}