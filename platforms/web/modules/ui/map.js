var comp = require('./Compositer.js');

var map = module.exports = function(object){
    this.html = document.createElement('input');
    this.html.type = 'button';
    var unit = this;
    
    this.id(comp.Unit.pool.put(this));
    this.init(object);
    
    this.prepare(object);
    
    this.destroy = function(){
	comp.Unit.pool.free(this.id());
	this.html = null;
    };
};

map.prototype = new comp.Unit(undefined, undefined);

map.prototype.init = function(object){
   this.html.value = 'uhaha';
};