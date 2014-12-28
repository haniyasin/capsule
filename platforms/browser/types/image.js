function image(_image){
    this.id = 'generated';
}

image.prototype = {
    get_data : function(){
	if(this.hasOwnProperty('oio'))
	    return this.oio.read(this.id, 'raw', false);
    }
};

module.exports = image;