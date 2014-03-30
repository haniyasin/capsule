//this is just envelope around web Compositer, for now
//it is very important because of on many other platforms impossible to implement Compositer and base_items together

exports.create = function(comp){
    return {
	image : {
	    "create" : comp.image_create,
	    "destroy" : comp.image_destroy
	},
   
	text : {
	    "create" : comp.text_create,
	    "destroy" : comp.text_destroy
	}
    }
}