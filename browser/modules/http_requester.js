var bb_allocator = require('../../dependencies/bb_allocator.js');
// iframe

function script_allocator(){
    var ids = new bb_allocator.create(bb_allocator.id_allocator);

    var head = document.getElementsByTagName('head')[0];
    var script_tag = document.createElement('script');
    script_tag.setAttribute('id', 'script_transport_data');
    //reply callback array, краткость для экономии траффика:D
    script_tag.innerHTML = 'var rca = []';
    head.appendChild(script_tag);
    
    this.create = function(){
	return {
	    'req_id' : '',
	    'send' : function(context, data,  data_cb, err_cb){
		this.req_id = ids.alloc();
		var head = document.getElementsByTagName('head')[0];
		var script_tag = document.createElement('script');
		script_tag.setAttribute('id','s' + this.req_id);
		//нужны проверки данных
		script_tag.setAttribute('src',context.url + '?' + data + 'jsonp=rca[' + this.req_id + ']');
		rca[this.req_id] = function(reply){
                    head.removeChild(script_tag);
                    ids.free(this.req_id);
                    rca[this.req_id] = undefined;
                    data_cb(reply);
		}
		head.appendChild(script_tag);

	    }	    
	}
    }
    
    this.destroy = function(obj){
	
	//зачистить теги script за собой	
    }
//	var script_tag = document.getElementById('script_transport_data');
//	script_tag.parentNode.removeChild(script_tag);
}

function xhr_allocator(){
    this.create = function(){
	var _req = new XMLHttpRequest();
	_req.timeout = 5;
	var _on_done;
	var _on_load;
	var _on_closed;
	_req.onreadystatechange = function(){
	    switch(_req.readyState){
		case 3 : 
		if(typeof(_on_load) == 'function')
		    _on_load(_req.responseText);
		break;

		case 4 :
		if(typeof(_on_closed) == 'function')
		    _on_closed();		
	    }
	}
        return {
	    'send_once' : function(context, data, recv_cb, err_cb){
		_req.onload = function(){ recv_cb(_req.responseText) };
		_req.open(context.method, context.url,true);
		_req.send(data);
	    },
	    'open' : function(context){
		_req.open(context.method, context.url, true);		
	    },
	    'send' : function(data){
		_req.send(data);
	    },
	    'close' : function(){
		_on_closed();
	    },
	    'on_recv' : function(recv_cb){
		_on_load =_req.onload = function(){ recv_cb(_req.responseText) };
	    },
	    'on_closed' : function(closed_cb){
		_on_closed =_req.ontimeout = closed_cb;
	    },
	    'on_err' : function(error_cb){
	    }
	    
	}
    }
    
    this.destroy = function(obj){
	obj._req.abort();
	obj._req = null;
	delete obj;
    }
}

var xhr_allocator = new bb_allocator.create(xhr_allocator);
var script_allocator = new bb_allocator.create(script_allocator);
exports.TYPE_SCRIPT = 0;
exports.TYPE_XHR_1 = 1;
function get_allocator(type){
    if(type == 'xhr')
	return xhr_allocator;
    else 
	if(type == 'script')
	    return script_allocator;    
}
exports.send = function(type, context, data,  data_cb, err_cb){
    var allocator = get_allocator(type);
    
    var req = allocator.alloc(context);
    //for xhr, not for script allocator.free(xhr)
    req.send_once(context, data, function(data){
		      data_cb(data);
		      allocator.free(req);
		  }, err_cb);
}

exports.create = function(type){
    var allocator = get_allocator(type);
    var req = allocator.alloc();
    req.free = function(){
	allocator.free(req);
    }
    return req;
}