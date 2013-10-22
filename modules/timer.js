exports.create = function(callback, milisec, cycle){
    return {
	cycle : cycle,
	id : cycle ? setInterval(callback, milisec) : setTimeout(callback, milisec),
	destroy : function(){
	    cycle ? clearInterval(this.id) :clearTimeout(this.id);
	}
    }
}