/*
 * common blocks for working on animation
 */

exports.toggle = function(comp, name, on_chain, off_chain){
    var aonchain = comp.anim_create(on_chain),
    aoffchain = comp.anim_create(off_chain);

    function hon(){
	this.toggled = true;
	comp.anim_start(this.baon);	
    }

    function hoff(){
	this.toggled = false;
	comp.anim_start(this.baoff);		
    }
    this.bind = function(widget){
	widget[name] = {
	    toggled : false,
	    baon : comp.anim_bind(widget.frame, aonchain),
	    baoff : comp.anim_bind(widget.frame, aoffchain),
	    on : hon,
	    off : hoff
	};
    };

    this.unbind = function(widget){
	comp.anim_unbind(widget.anim.banimslu);
	comp.anim_unbind(widget.anim.banimsld);
	widget[name] = undefined;
    };
}
