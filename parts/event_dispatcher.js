/*
 * Аналог такой вещи как EventEmitter, если можно так выразится.
 * В целом задача обеспечить похожее api, то есть испускать события через emit и
 * подписываться через on. Но с той разницей, чтобы можно было отлавливать 
 * события подписывания потребителем. Это часто нужно, чтобы проделать кучу 
 * действий по подготовке к испусканию события. 
 * Правда стоит сказать, что подобное отлавливание может приводить к испусканию
 * события в обход emit, но в этом также состоит цель, ибо это часто 
 * оптимально.
 * Главное, чтобы в случае опускания callback удалялся ранее установленный 
 * callback, при этом не важно где хранился этот callback, как доступный для
 * emit или внутри отлавливающего.  
 *   
 */

function dispatcher(){
}

dispatcher.prototype.event_dispatcher_init = function(){
    this.handlers = {};
    this.catchers = {};    
};

dispatcher.prototype.on = function(name, callback){
    if(this.handlers[name]){
	if(callback)
	    this.handlers[name] = callback;
	else 
	    delete this.handlers[name];
    } else {
	if(this.catchers[name]){
	    if(this.catchers[name].call(this, name, callback) && callback)
		this.handlers[name] = callback;
	} else
	    if(callback)
		this.handlers[name] = callback;
    }

    return true;    
};

dispatcher.prototype.catch_on = function(names, callback){
    var ind;
    for(ind in names){
	this.catchers[names[ind]] = callback;
    }    
};

dispatcher.prototype.emit = function(name, data){
    if(this.handlers[name])
	this.handlers[name](data);
};

module.exports = dispatcher;

