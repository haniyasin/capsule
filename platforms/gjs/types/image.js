const GdkPixbuf = imports.gi.GdkPixbuf;
const rsvg = imports.gi.Rsvg;
const g = imports.gi.GLib;

function image(type, encoding, data){
    this.capsule_type = 'image';
    this.id = 'generated';
    if(typeof(type) == 'string'){
	this.type = type;
	this.encoding = encoding;
	this.data = g.base64_decode(data);
	switch(this.type){
	    case "png" : 
	    let loader = GdkPixbuf.PixbufLoader.new_with_type('png');
	    loader.write(this.data);
	    this.pixbuf = loader.get_pixbuf();
	    break;

	    case "svg+xml" :
	    let handle = rsvg.Handle.new_from_data(this.data);
	    this.pixbuf = handle.get_pixbuf();
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