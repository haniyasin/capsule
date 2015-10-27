function image(type, encoding, data){
    this.capsule_type = 'image';
    this.id = 'generated';
    if(typeof(type) == 'string'){
	this.type = type;
	this.encoding = encoding;
	this.data = data;
	switch(this.type){
	    case "png" : 
	    let loader = GdkPixbuf.PixbufLoader.new_with_type('png');
	    loader.write(GLib.base64_decode(data));
	    this.pixbuf = loader.get_pixbuf();
	    break;
	    case "svg+xml" :
	    break;
	}
    }
    else 
	if(_image instanceof image){
	    this.type = type.type;
	    this.encoding = this.encoding;
	    this.data = type.data;	    
	}
}

module.exports = image;