exports.create = function(callback, milisec, cyclic){
    return {
	id : cyclic ? setInterval(callback, milisec) : setTimeout(callback, milisec),
	destroy : function(){
	    cyclic ? clearInterval(this.id) : clearTimeout(this.id);
	}
    }
}