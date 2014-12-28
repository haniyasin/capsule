/*
 * toplevel implementation of io concept
 * 
 */

function base_io(){
    
};

base_io.prototype = {
    get_info : function(){
    },
    bind : function(){
	
    },
    read : function(callback){
    },
    write : function(callback){
    },
    close : function(){
    }
};

function set_container_io(object){
    object.prototype.append = function(data_object){
    };
    object.prototype.change = function(number, data_object){
    };
}

function set_box_io(object){
    object.prototype.on_arrive = function(callback){
    };   
}

function file(path, type, async){
    
}

function tcp(path, type, async){
    
}

function pipe(path, type, async){
    
}

exports.create = function(path, async){
    //разбираем тут path, вытаскиваем тип низлежащей реализации
    var underlayer_impl;
    if(implementations.hasOwnProperty(underlayer_impl))
	return new implementaions[underlayer_impl].create(path, type, async);
};

exports.open = function(path, type, async){
    var underlayer_impl;
    if(implementations.hasOwnProperty(underlayer_impl))
	return new implementaions[underlayer_impl].open(path, type, async);    
};

