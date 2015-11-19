/*
  Compositer module base on web technologies

  Copyright (C) 2011  Alexey Bagin aka freeze (email freeze@2du.ru)
  Copyright (c) 2014-2015  Nikita Zaharov aka ix (email ix@2du.ru)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as
  published by the Free Software Foundation, either version 3 of the
  License, or (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.'

  version 0.8
*/

/* Compositer */

var bba = require('parts/bb_allocator'),
    id_allocator = new bba.allocator(bba.id_allocator);

'use strict';

/* Universal method to take window size in different browsers */

var wsSize = {};

wsSize.detect = function () {
    this.way =
        (window.innerWidth &&
         window.innerHeight) ? 1 :
        (document.body &&
         document.body.clientWidth &&
         document.body.clientHeight) ? 2 :
        (document.documentElement &&
         document.documentElement.clientWidth &&
         document.documentElement.clientHeight) ? 3 : 4;

    return this.way;
};

wsSize.take = function () {
    var way = (this.way === undefined) ? this.detect() : this.way;

    switch (way) {
    case 1:
        return {
            width : window.innerWidth,
            height : window.innerHeight
        };

    case 2:
        return {
            width : document.body.clientWidth,
            height : document.body.clientHeight
        };

    case 3:
        return {
            width : document.documentElement.clientWidth,
            height : document.documentElement.clientHeight
        };
    default:
        throw new Error(
            'Can not detect window size in this browser'
        );
    }
};

/* Unit */

/** @constructor */

var Unit = function () {
};

//set id of element if passed or get if it is not
Unit.prototype.id = function (id) {
    var parseResult;

    if (typeof id !== 'number') {
        parseResult = (/^_(\d+)$/).exec(this.html['id']);

        if (parseResult !== null) {
            return +parseResult[1];
        }
    } else {
        this.html['id'] = '_' + id;

        return undefined;
    }
};

Unit.prototype.prepare = function (object) {
    this.id(id_allocator.alloc());
    this.html.style.position = 'fixed';
    this.html.style.margin   = '0px';
    this.html.style.padding  = '0px';

    var value, propertyName;

    for (propertyName in this.defaults) {
        if (this.defaults.hasOwnProperty(propertyName)) {
            if (typeof object[propertyName] === 'string' ||
		typeof object[propertyName] === 'number') {
                value = new Unit.Value(object[propertyName], propertyName);
            } else {
                value =
                    new Unit.Value(this.defaults[propertyName], undefined);
            }

            this[propertyName] = value;

            value.apply(this);
        }
    }

    return undefined;
};

Unit.prototype.change_props = function(info){
    var field;
    for(field in info){
	this[field].value = info[field];
	this[field].apply(this);
    }
    return true;	
};

Unit.prototype.defaults = {
    width   : {type : 'width',   value : 100, unit : '%' },
    height  : {type : 'height',  value : 100, unit : '%' },
    x       : {type : 'x',       value : 0,   unit : 'px'},
    y       : {type : 'y',       value : 0,   unit : 'px'},
    z_index : {type : 'z_index', value : 1               },
    opacity : {type : 'opacity', value : 0,   unit : '%' }
};

Unit.prototype.event_correct = {
    'pointer_in'     : 'onmouseover',
    'pointer_out'    : 'onmouseout',
    'pointer_down'   : 'onmousedown',
    'pointer_up'     : 'onmouseup',
    'pointer_motion' : 'onmousemove',

    'key_down'       : 'onkeydown',
    'key_up'         : 'onkeyup',


    'mouseover'      : 'pointer_in',
    'mouseout'       : 'pointer_out',
    'mousedown'      : 'pointer_down',
    'mouseup'        : 'pointer_up',
    'mousemove'      : 'pointer_motion',

    'keydown'        : 'key_down',
    'keyup'          : 'key_up'
};

function process_mouse_event(element, event){
    var re_disassemble = /(\d+)px/;
    var x = event.clientX - re_disassemble.exec(element.html.style.left)[1],
    y = event.clientY - re_disassemble.exec(element.html.style.top)[1];
    return [{
		'pointer_id' : 0,
		
		'x' : (element.width.unit  === '%') ?
                    (100 / element.width.px().value  * x) :
                    x,
		
                'y' : (element.height.unit === '%') ?
                    (100 / element.height.px().value * y) :
		    y
            }];    
}

function process_key_event(element, event){
    var eventData = {
        'key_obj' :
        {
                'group_id' : 0, 'keynum' : event.keyCode,
                'key_modificators' : {}
            }
        };

        if (event['ctrlKey']) {
            eventData['key_obj']['key_modificators']['ctrl']  = true;
        }

        if (event['shiftKey']) {
            eventData['key_obj']['key_modificators']['shift'] = true;
        }

        if (event['metaKey']) {
            eventData['key_obj']['key_modificators']['alt']   = true;
        } 
   
    return eventData;
}

Unit.prototype.on = function(event_name, callback){
    if (typeof event_name !== 'string')
    {
        return false;
    }

    var self = this;

    if(event_name == 'animation_stopped'){
	if(callback)
	    this.on_animation_stopped = callback;
	else 
	    delete this.on_animation_stopped;
    }

    event_name = this.event_correct[event_name];

    if (event_name === undefined) {
        return false;
    }

    if ((/mouse/).test(event_name)) {
	if(callback)
            this.html[event_name] = function(event){
		callback(process_mouse_event(self, event));
	    };
	else
            delete this.html[eventName];
    }

    if ((/key/).test(event_name)) {
	if(callback)
            document[event_name] = function(event){
		callback(process_key_event(self, event));
	    };
	else
	    delete document[eventName];
    }

    return true;
};

/* Value */

/** @constructor */

Unit.Value = function (value, type) {
    var typeName =
        (typeof type === 'string') ? type :
        (typeof value === 'object' &&
         typeof value.type === 'string') ? value.type : null;

    if (typeName === null) {
        return undefined;
    }

    if (typeof this.types[typeName] !== 'function') {
        return undefined;
    }

    var dissassembleResult;

    value =
        (typeof value === 'number') ? value = { value : value, unit : ''} :
    (typeof value === 'object') ? value :
        (typeof value === 'string') ?
        (typeof
         (dissassembleResult = this.dissassemble(value)) ===
         'object') ? dissassembleResult : {}
    : {};

    type = new this.types[typeName]();

    type.type = typeName;

    type.value =
        (typeof value.value === 'number') ? value.value  :
        (!isNaN(+value.value))            ? +value.value : 0;

    type.unit = (typeof value.unit === 'string') ? value.unit : null;

    return type;
};

Unit.Value.prototype.dissassemble = function (input) {
    var parseResult = (/([+,\-]?\d+\.?\d*)(\D*)/).exec(input);

    if (parseResult === null) {
        return false;
    }

    var result = {};

    result.value = +parseResult[1];
    result.unit  =  parseResult[2];

    if (result.value === undefined) {
        result.value = 0;
    }

    if (result.unit === '')  {
        result.unit = null;
    }

    return result;
};

Unit.Value.prototype.group = function () {
    var propertyGroup =
        (this.type === 'width' || this.type === 'height') ? 'size'     :
        (this.type === 'x'     || this.type === 'y'     ) ? 'position' :
        'other';

    return propertyGroup;
};

Unit.Value.prototype.apply = function (target) {
    var group = this.group(),

    unit = ((this.unit === null) ? '%' : this.unit),
    type = this.px(target, true),

    assembledValue = Math.round(type.value);


    if (group === 'size') {
        assembledValue = Math.abs(assembledValue);
    }

    assembledValue += 'px';

    target.html.style[this.correct[this.type]] = assembledValue;

    if (group === 'size' && typeof target.resized === 'function') {
        target.resized();
    }

    var childKey, child;

    for (childKey in target.children) {
        if (target.children.hasOwnProperty(childKey)) {
            child = target.children[childKey];
            child[this.type].apply(child);
        }
    }

    return undefined;
};

Unit.Value.prototype.px = function (context, recalc) {
    if (recalc !== true && typeof this.cache === 'object') {
        return this.cache;
    }

    var group = this.group();

    if (group === 'other') {
        return undefined;
    }

    var parent = context.parent;

    var value;

    if(this.unit === 'px'){
	value = (typeof parent === 'object') ?
	    group == 'size' ? 
	    this.value :
	    parent[this.type].px(parent).value + this.value 
	:
	this.value;
	
    } else {
        value =
            (typeof parent === 'object') ?
            (group === 'size') ?
            parent[this.type].px(parent).value / 100 * this.value 
	    :
            parent[this.type].px(parent).value +
            parent[
                (this.type === 'x') ? 'width' : 'height'
            ].px(parent).value / 100 * this.value 
        :
        (this.type === 'x' || this.type === 'y') ? 0 :
            (this.type === 'width') ?
            wsSize.take().width : wsSize.take().height;	    
    }


    this.cache = new Unit.Value({
				    type  : this.type,
				    value : value,
				    unit  : 'px'
				}, undefined);

    return this.cache;
};

Unit.Value.prototype.correct = {
    width  : 'width',
    height : 'height',
    x      : 'left',
    y      : 'top'
};


/* Value types */

Unit.Value.prototype.types = {};


/* Width type */

Unit.Value.prototype.types['width'] = function () {};
Unit.Value.prototype.types['width'].prototype = new Unit.Value(undefined, undefined);

Unit.Value.prototype.types['width'].prototype.work = true;


/* Height type */

Unit.Value.prototype.types['height'] = function () {};
Unit.Value.prototype.types['height'].prototype = new Unit.Value(undefined, undefined);

Unit.Value.prototype.types['height'].prototype.work = true;


/* X type */

Unit.Value.prototype.types['x'] = function () {};
Unit.Value.prototype.types['x'].prototype = new Unit.Value(undefined, undefined);

Unit.Value.prototype.types['x'].prototype.work = true;


/* Y Type */

Unit.Value.prototype.types['y'] = function () {};
Unit.Value.prototype.types['y'].prototype = new Unit.Value(undefined, undefined);

Unit.Value.prototype.types['y'].prototype.work = true;


/* Z-index type */

Unit.Value.prototype.types['z_index'] = function () {};
Unit.Value.prototype.types['z_index'].prototype = new Unit.Value(undefined, undefined);

Unit.Value.prototype.types['z_index'].prototype.work = true;

Unit.Value.prototype.types['z_index'].prototype.apply = function (target) {
    target.html.style.zIndex = this.value;
};


/* Opacity type */

Unit.Value.prototype.types['opacity'] = function () {};
Unit.Value.prototype.types['opacity'].prototype = new Unit.Value(undefined, undefined);

Unit.Value.prototype.types['opacity'].prototype.apply = function (target) {
    if (this.constructor.prototype.work === false) {
        return undefined;
    }

    var opacity = 1 - (Math.abs(this.value) / 100);

    opacity = (opacity < 0) ? 0 : opacity;

    target.html.style.opacity = opacity;

    if (this.constructor.prototype.work === undefined) {

        if (+target.html.style.opacity === opacity) {
            this.constructor.prototype.work = true;
        } else {
            this.constructor.prototype.work = false;

            return undefined;
        }
    }

    return undefined;
};

/* Frame unit */

function frame (object) {
    this.children = [];

    this.html = document.createElement('div');

    if (typeof object.color === 'string') {
        this.html.style.backgroundColor = object.color;
    }
    this.html.ondragstart = function(){ return false; };

    this.prepare(object);
};


frame.prototype = new Unit();

frame.prototype.destroy = function(){
    id_allocator.free(thid.id());
    //fixme
};

frame.prototype.add = function(child){
    if (child  === undefined) {
        return undefined;
    }

    this.children.push(child);
    child.parent = this;

    this.html.appendChild(child.html);

    var propertyKey;

    for (propertyKey in child.defaults) {
        if (child.defaults.hasOwnProperty(propertyKey)) {
            child[propertyKey].apply(child);
        }
    }

    return undefined;
};

frame.prototype.remove = function(element){
    if (element === undefined) {
        return undefined;
    }

    var parent = element.parent;

    if (parent === undefined) {
        return undefined;
    }

    var child, childs = parent.children;

    var childs_counter = childs.length - 1;
    while (children_counter >= 0) {
        child = children[children_counter];

        if (child === element) {
	    parent.html.removeChild(child.html);
	    children.splice(children_counter, 1);
            break;
        }
	children_counter--;
    }

    delete element.parent;

    return undefined;
};

/*
Compositer.prototype['frame_info'] = function () {
    var unitTypeName, valueTypeName, elems = {}, work,
    unitTypes  = Unit.prototype.types,
    valueTypes = Unit.Value.types;

    for (unitTypeName in unitTypes) {
        if (unitTypes.hasOwnProperty(unitTypeName)) {
            elems[unitTypeName] = {};

            for (valueTypeName in valueTypes) {
                if (valueTypes.hasOwnProperty(valueTypeName)) {
                    work = valueTypes[valueTypeName].prototype.work;

                    if (work === true) {
                        elems[unitTypeName][valueTypeName] = true;
                    }
                }
            }
        }
    }

    return {
	perfomance : 'normal',
	elements : elems
    };
}
*/

/* Root unit */

function root(){
    if (typeof document.body !== 'object' || typeof wsSize.take() !== 'object') {
        return false;
    }

    this.html = document.body;

    this.html.innerHtml = '';

    this.prepare({});

    var root = this;

    window.onresize = function () {
        root.width.value  = wsSize.take().width;
        root.height.value = wsSize.take().height;

        root.width.apply(root); root.height.apply(root);

        var childKey, propertyKey, child;

        for (childKey in root.children) {
            if (root.children.hasOwnProperty(childKey)) {
                child = root.children[childKey];

                for (propertyKey in child.defaults) {
                    if (child.defaults.hasOwnProperty(propertyKey)) {
                        child[propertyKey].apply(child);
                    }
                }
            }
        }
    };    
};

root.prototype = new frame({});

function image(object){
    this.html = document.createElement('img');

    if (typeof object.source === 'string') {
        this.html.src = object.source;
    } else
	if(typeof object.source == 'object'){
	    this.html.src = object.source.get_link_http();
	}

    this.html.alt = '';
    this.html.ondragstart = function(){ return false; };

    this.prepare(object);
};

image.prototype = new Unit();

image.prototype.destroy = function(){
    id_allocator.free(thid.id());
    //FIXME
};

function text(object){
        this.html = document.createElement('span');

    this.html.style.fontFamily = 'monospace';
    this.html.style.textAlign  = 'center';
    this.html.style.whiteSpace = 'pre';

    if (typeof object.text === 'string') {
        this.html.innerHTML = object.text;
    }

    if (typeof object.color === 'string') {
        this.html.style.color = object.color;
    }

    this.prepare(object);
}

text.prototype = new Unit();

text.prototype.destroy = function(){
    id_allocator.free(thid.id());
    //FIXME
}

text.prototype.resized = function () {
    if (typeof this.width !== 'object' || typeof this.height !== 'object') {
        return undefined;
    }

    this.fontSize.apply(this);
};

text.prototype.fontSize = {
    detect : function () {
	var span = document.createElement('span'), fontSize = 16;

	span.innerHTML        = 'X';

	span.style.position   = 'fixed';

	span.style.margin     = '0px';
	span.style.padding    = '0px';

	span.style.fontFamily = 'monospace';
	span.style.fontSize   = fontSize + 'px';

	document.body.appendChild(span);

	this.widthWeight = fontSize / span.clientWidth;

	document.body.removeChild(span);

	return this.widthWeight;
    },
    apply : function (target) {
	var widthWeight =
            (this.widthWeight === undefined) ?
            this.detect() : this.widthWeight,

	string = target.html.innerHTML,

	width  = target.width.px().value,
	height = target.height.px().value,

	font   = {
            width  : width / string.length * widthWeight,
            height : height
	},

	fontSize = (font.width < font.height) ? font.width : font.height;

	target.html.style.fontSize   = fontSize + 'px';
	target.html.style.lineHeight = height   + 'px';
    }
};

function entry(object){
    this.html = document.createElement('input');
    this.html.type = 'text';
    var unit = this;

    if (typeof object.placeholder === 'string') {
        this.html.placeholder = object.placeholder;
    }

    if (typeof object.size === 'string') {
        this.html.size = object.size;
    }

    this.prepare(object);
};

entry.prototype = new Unit();

entry.prototype.destroy = function(){
    id_allocator.free(thid.id());
    //FIXME
};

entry.prototype.on_text_change = function(callback){
    this.html.onchange = function(){
	callback(unit.html.value);
    };
};

entry.prototype.set_placeholder = function(text){
	    this.html.placeholder = text;
};

entry.prototype.get_value = function(){
	    return this.html.value;
};

entry.prototype.set_value = function(value){
    this.html.value = value;
};

function button(object){
    this.html = document.createElement('input');
    this.html.type = 'button';
    var unit = this;

    if (typeof object.label === 'string') {
        this.html.value = object.label;
    }
    if (typeof object.on_press === 'function'){
	this.html.onclick = object.on_press;
    }

    this.prepare(object);
};

button.prototype = new Unit();

button.prototype.destroy = function(){
    id_allocator.free(thid.id());
    //FIXME
};

button.prototype.on_press = function(callback){
    this.html.onclick = function(){
	callback();
    };
};

button.prototype.set_label = function(label){
    this.html.value = label;	
};

function video(object){
    this.html = document.createElement('video');
    var unit = this;
    this.source_child = document.createElement('source');
    unit.html.style = 'object-fit:fill;';

    if (typeof object.source === 'string') {
	//            this.html.size = object.size;
    }

    this.prepare(object);
};

video.prototype = new Unit();

video.prototype.destroy = function(){
    id_allocator.free(thid.id());
    //FIXME
};

video.prototype.load = function(file){
    this.source_child.src = file.uri;	
    unit.html.appendChild(unit.source_child);
};

video.prototype.play = function(callback){
    this.html.play();
};

video.prototype.pause = function(){
    this.html.pause();
};

video.prototype.set_position = function(mseconds){
	    this.html.currentTime = mseconds / 1000;
};

video.prototype.get_position = function(){
	    return this.html.currentTime * 1000;
};

video.prototype.get_duration = function(){
	    return this.html.duration * 1000;
};

video.prototype.get_volume = function(){
	    return this.html.volume;
};

video.prototype.set_volume = function(volume){
	    this.html.volume = volume;
},

video.prototype.ontimeupdate = function(callback){
    this.html.ontimeupdate = callback;
};

// Animation//

// @constructor //

function animation(chain){
    if (!this.init(chain))
        return {};
};

animation.prototype.init = function(chain){
    if (
        chain             === undefined ||
            chain.constructor !== Array     ||
            chain.length      <   1
    ) {
        return false;
    }

    this.binded = {};
    this.acts  = chain;

    return true;
};

animation.prototype.bind = function(element){
    if (element === undefined) {
        return false;
    }

    var bind = new binded_anim(element, this);
    this.binded[element.id()] = bind;
   
    return true;
};

animation.prototype.unbind = function(element){
    if (element === undefined) {
        return false;
    }

    this.binded[element_id()].destroy();
    delete this.binded[element.id()];

    return true;
};

animation.prototype.start = function(element) {
    if (element === undefined) {
        return false;
    }
    
    this.binded[element.id()].start();

    return true;;
};

animation.prototype.stop = function(element) {
    if (element === undefined) {
        return false;
    }
    
    this.binded[element.id()].stop();

    return true;;
};

// Animation bind //

/// @constructor //

function binded_anim(element, animation){
    //FIXME нужна проверка аргументов
    this.id = id_allocator.alloc();
    this.element   = element;
    this.animation = animation;

    this.act = 0;
    this.initAct(this.act, undefined);
};

binded_anim.prototype.destroy = function(){
    id_allocator.free(this.id);
};

binded_anim.prototype.initAct = function(actId, late){
    var act = this.animation.acts[actId];

    if (act === undefined) {
        this.act = 0;
        this.initAct(this.act, undefined);

        this.stop();

        return undefined;
    }

    this.duration =
        (act['duration']) ? act['duration'] + ((late) ? late : 0) : 0;

    this.vectors = {};

    var actionName;

    for (actionName in act['actions']) {
        if (act['actions'].hasOwnProperty(actionName)) {
            this.vectors[actionName] = act['actions'][actionName];
        }
    }

    return true;
};

binded_anim.prototype.start = function () {
    animation.worker.runned[this.id] = this;

    animation.worker(undefined);
};

binded_anim.prototype.stop = function () {
    delete animation.worker.runned[this.id];
    //if (this.callback) //нужно для восстановления доставки события по binded_id
    if(this.element.on_animation_stopped)
	this.element.on_animation_stopped({type : 'animation_stopped'});

    return true;
};

binded_anim.prototype.blink = function (delay) {
    var last;

    if (this.duration - delay < 0) {
        last = true;
    }

    var vectorId, vectorOffset, step;

    for (vectorId in this.vectors) {
        if (this.vectors.hasOwnProperty(vectorId)) {
            vectorOffset = this.vectors[vectorId];

            step =
                (last) ?
                vectorOffset :
                (vectorOffset / (this.duration / delay));

            this.element[vectorId].value += step;
            this.element[vectorId].apply(this.element);

            this.vectors[vectorId] -= step;
        }
    }

    this.duration = this.duration - delay;

    if (last) {
        this.initAct(++this.act, this.duration);
    }

    return undefined;
};


// Animation worker //

animation.worker = function (work) {
    if (!work) {
        if (animation.worker.already) {
            return undefined;
        }
    }

   animation.worker.already = true;

    var delay =
        (animation.worker.last) ?
        (new Date()).getTime() - animation.worker.last.getTime() :
        1000 / animation.worker.maxFps,


    runned = animation.worker.runned,

    runned_id, more;

    if (runned.length != 0) {
        for (runned_id in runned) {
            if (runned.hasOwnProperty(runned_id)) {
                var bind = runned[runned_id];

                if (bind) {
                    bind.blink(delay);
                }
            }
        }

        more = true;
    }

    if (more !== true) {
        animation.worker.already = false;
        delete animation.worker.last;

        return undefined;
    }

    animation.worker.last = new Date();

    setTimeout(
        function () {animation.worker(true);},
        1000 / animation.worker.maxFps
    );

    return undefined;
};

animation.worker.runned = {};

animation.worker.maxFps = 100;

/*
Compositer.prototype['elem_get_geometry'] = function(elemId, px){
    if (typeof elemId !== 'number') {
        return undefined;
    }

    var elem = Unit.pool.take(elemId);

    return {
	x : px ? elem.x.px().value : elem.x.value,
	y : px ? elem.y.px().value : elem.y.value,
	width : px ?  elem.width.px().value : elem.width.value,
	height : px ? elem.width.px().value : elem.height.value
    };	
};
*/
function ui() {
    this.root = new root();

    if (typeof this.root === 'object')
        return true;
    else 
        throw new Error('You can create Compositer object only after load DOM');
};

ui.prototype = {
    Unit : Unit,
    frame : frame,
    image : image,
    text : text,
    entry : entry,
    video : video,
    anim : animation
};

module.exports = ui;


