/*
 * common blocks for working on animation
 */

exports.toggle = function(comp, name, on_chain, off_chain){
    var aonchain = comp.anim_create(on_chain),
        aoffchain = comp.anim_create(off_chain);

    function _toggle(){
	if(this.runned)
	    return false;

	this.runned = true;

	if(this.toggled){
	    this.toggled = false;
	    comp.anim_start(this.baoff);		
	} else {
	    this.toggled = true;
	    comp.anim_start(this.baon);	    
	}

	return true;	
    }

    this.bind = function(widget){
	widget[name] = {
	    runned : false,
	    toggled : false,
	    baon : comp.anim_bind(widget.frame, aonchain),
	    baoff : comp.anim_bind(widget.frame, aoffchain),
	    toggle : _toggle
	};
	
	comp.event_register(widget.frame, 'animation_stopped', function(){
				widget[name].runned = false;
			    }
			   );
    };

    this.unbind = function(widget){
	comp.anim_unbind(widget.anim.banimslu);
	comp.anim_unbind(widget.anim.banimsld);
	widget[name] = undefined;
    };
}
