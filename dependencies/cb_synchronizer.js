exports.create = function(){
    var callbacks = [];
    return {
	"add" : function(callback, how_many){
	    if(how_many == undefined)
		how_many = 1;
	    callbacks.push([callback, how_many]);
	    var parent = this;
	    return function(){
		for (ind in callbacks){
		    if(callbacks[ind][0] == callback){
			var how_many = callbacks[ind][1] -= 1;
			if(how_many == 0){
			    callbacks.splice(ind,1);
			}
		    }
		}
		callback.apply(this, arguments);
//		callback.apply(this, Array.prototype.reverse.call(arguments));
		if(!callbacks.length)
		    parent.after_all();
	    }
	},

	"after_all" : function(callback){
	}
    }
}