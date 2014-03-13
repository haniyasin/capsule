/*
 * @description
 * For connecting remote module and reacting remote clients purpose
 * 
 */
exports.features = {
    "only_add" : 1
}

exports.create = function(context, features){
    return {
	"on_connect" : function(module_name){
	},
	"on_disconnect" : function(module_name){
	},
	"destroy" : function(){
	}
    }
}

