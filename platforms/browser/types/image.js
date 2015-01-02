function image(type, encoding, data){
    this.capsule_type = 'image';
    this.id = 'generated';
    if(typeof(type) == 'string'){
	this.type = type;
	this.encoding = encoding;
	this.data = data;
    }
    else 
	if(_image instanceof image){
	    this.type = type.type;
	    this.encoding = this.encoding;
	    this.data = type.data;	    
	}
}

image.prototype = {
    serialize : function(type){
	switch(type){
	    case 'JSON' : 
	    return JSON.stringify(this);
	    break;
	    
	    case 'binary' : 
	    break;
	}
    },
    get_data : function(type){
//	switch(type){
//	    case 'base64' : 
//	    return
//	}
//	if(this.hasOwnProperty('oio'))
//	    return this.oio.read(this.id, 'raw', false);
    },
    get_link_http : function(){
	return 'data:image/' + this.type + ';' + this.encoding + ',' + this.data;
    }
};

module.exports = image;