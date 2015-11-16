/*
 * common blocks for working on animation
 */

/*
 * anim_info = [
 *     {
 *         elements : [id1, id2],
 *         on : chain,
 *         off : chain 
 *     }
 * ]
 */

function _toggle(){
//    alert('huhu', this.runned);    
    if(this.runned)
	return false;
    
    if(this.toggled){
	this.toggled = false;
	this._start('boff');		
    } else {
	this.toggled = true;
	this._start('bon');	    
    }
    
    return true;	
}

exports.many_toggle = function(comp, anim_info){
    var anim_ind, el_ind,   
        anim_arr = this.anim_arr = [],
        self = this;
    for(anim_ind in anim_info){
	anim_arr[anim_ind] = {};
	anim_arr[anim_ind].on = comp.anim_create(anim_info[anim_ind].on);
	anim_arr[anim_ind].off = comp.anim_create(anim_info[anim_ind].off);
	anim_arr[anim_ind].bon = [];
	anim_arr[anim_ind].boff = [];
	for(el_ind in anim_info[anim_ind].elements){
	    anim_arr[anim_ind].bon.push(comp.anim_bind(anim_info[anim_ind].elements[el_ind], anim_arr[anim_ind].on));
	    anim_arr[anim_ind].boff.push(comp.anim_bind(anim_info[anim_ind].elements[el_ind], anim_arr[anim_ind].off));
	    comp.event_register(anim_info[anim_ind].elements[el_ind], 'animation_stopped', function(){
				    self.runned--;		    
				});
	}
    }

    this.anim_arr = anim_arr;
    this.runned = 0;
    this.toggled = false;
    
    function _anim_starter(onoff){
	anim_arr = this.anim_arr;
	for(anim_ind in anim_arr){
	    for(el_ind in anim_arr[anim_ind][onoff]){
		this.runned++;
		comp.anim_start(anim_arr[anim_ind][onoff][el_ind]);
	    }   
	}
    }

    this._start = _anim_starter;
};

exports.many_toggle.prototype.toggle = _toggle;

exports.toggle = function(comp, name, on_chain, off_chain){
    var aonchain = comp.anim_create(on_chain),
        aoffchain = comp.anim_create(off_chain);

    this.bind = function(widget){
	widget[name] = {
	    runned : 0,
	    toggled : false,
	    bon : comp.anim_bind(widget.frame, aonchain),
	    boff : comp.anim_bind(widget.frame, aoffchain),
	    _start : function(onoff){ this.runned++; comp.anim_start(this[onoff]); },
	    toggle : _toggle
	};
	
	comp.event_register(widget.frame, 'animation_stopped', function(){
				widget[name].runned = 0;
			    }
			   );
    };

    this.unbind = function(widget){
	comp.anim_unbind(widget.anim.banimslu);
	comp.anim_unbind(widget.anim.banimsld);
	widget[name] = undefined;
    };
}
