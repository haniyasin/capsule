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
	this._start('off');		
    } else {
	this.toggled = true;
	this._start('on');	    
    }
    
    return true;	
}

exports.many_toggle = function(comp, anim_info){
    var anim_ind, el_ind,   
        anim_arr = this.anim_arr = [],
        self = this, element;
    for(anim_ind in anim_info){
	anim_arr[anim_ind] = {};
	anim_arr[anim_ind].on = new comp.anim(anim_info[anim_ind].on);
	anim_arr[anim_ind].off = new comp.anim(anim_info[anim_ind].off);
	anim_arr[anim_ind].elements = [];
	for(el_ind in anim_info[anim_ind].elements){
	    element = anim_info[anim_ind].elements[el_ind];
	    anim_arr[anim_ind].elements.push(element);
	    anim_arr[anim_ind].on.bind(element);
	    anim_arr[anim_ind].off.bind(element);
	    element.on('animation_stopped', function(){
			   self.runned--;		    
		       });
	}
    }

    this.runned = 0;
    this.toggled = false;
    
    function _anim_starter(onoff){
	for(anim_ind in anim_arr){
	    for(el_ind in anim_arr[anim_ind].elements){
		this.runned++;
		print(anim_arr[anim_ind].elements[el_ind].id);
		anim_arr[anim_ind][onoff].start([anim_arr[anim_ind].elements[el_ind]]);
	    }   
	}
    }

    this._start = _anim_starter;
};

exports.many_toggle.prototype.toggle = _toggle;

exports.toggle = function(comp, name, on_chain, off_chain){
    var a = { on : new comp.anim(on_chain),
              off : new comp.anim(off_chain)
	    };

    this.bind = function(widget){
	a.on.bind(widget.element),
	a.off.bind(widget.element);
	widget[name] = {
	    runned : 0,
	    toggled : false,
	    _start : function(onoff){ this.runned++; a[onoff].start(widget.element); },
	    toggle : _toggle
	};
	
	widget.element.on('animation_stopped', function(){
			      widget[name].runned = 0;
			  }
			 );
    };

    this.unbind = function(widget){
	a.off.unbind(windget.element);
	a.on.unbind(widget.element);
	widget[name] = undefined;
    };
}
