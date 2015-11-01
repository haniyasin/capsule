var error = require('parts/error');

exports.create = function(callback, millisec, cyclic){
    if(typeof(setInterval) == 'undefined'
       &&typeof(setTimeout) == 'undefined')
	return new error('not supported', 'this platform is not supported timer functionality');
 
    var id = cyclic ? setInterval(callback, millisec) : setTimeout(callback, millisec);
    return {
	destroy : function(){
	    cyclic ? clearInterval(id) : clearTimeout(id);
	}
    };
}