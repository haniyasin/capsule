var bb_allocator = require('../../../parts/bb_allocator.js');
// iframe

function script_allocator(){
    var ids = new bb_allocator.create(bb_allocator.id_allocator);
    var base32 = require('../../../dependencies/base32.js');

    var head = document.getElementsByTagName('head')[0];
    var script_tag = document.createElement('script');
    script_tag.setAttribute('id', 'script_transport_data');
    //reply callback array, краткость для экономии траффика:D
    script_tag.innerHTML = 'var rca = []';
    head.appendChild(script_tag);
    
    this.create = function(){
	var _on_recv,
	_on_closed,
	_on_error,
	script_tag;
	function compose_request(context, data, recv_cb, closed_cb, err_cb){
	    var id = ids.alloc();
	    var head = document.getElementsByTagName('head')[0];
	    script_tag = document.createElement('script');
	    script_tag.setAttribute('id','s' + id);
	    rca[id] = function(reply){
                head.removeChild(script_tag);
                ids.free(id);
                rca[id] = undefined;
		_on_closed();
                recv_cb(reply);
	    }
	    //прилепить сюда ещё превышение времени ожидание по таймеру надобно:)
	    return {
		'activate' : function(data){
		    //нужны проверки данных и передача данных
		    var data_str = '';
		    if(data)
			data_str = 'data=' + base32.encode(data) + '&'
		    script_tag.setAttribute('src',context.url + '?' + data_str + 'jsonp=rca[' + id + ']');
		    head.appendChild(script_tag);
		}
	    }
	}
	return {
	    '_req' : undefined,
	    'send_once' : function(context, data,  recv_cb, closed_cb, err_cb){
		compose_request(arguments).activate();
	    },
	    'open' : function(context){
		this._req = compose_request(context,null, _on_recv, _on_closed, _on_error);
	    },
	    'send' : function(data){
		this._req.activate(data);
	    },
	    'close' : function(){
                head.removeChild(script_tag);
	    },
	    'on_recv' : function(callback){
		_on_recv = callback;
	    },
	    'on_closed' : function(callback){
		_on_closed = callback;
	    },
            'on_err' : function(callback){
		_on_error = callback;
	    }	    
	}
    }
    
    this.destroy = function(obj){
	var script_tag = document.getElementById('script_transport_data');
	script_tag.parentNode.removeChild(script_tag);
	//зачистить теги script за собой	
    }
}

function xhr_allocator(){
    this.create = function(){
	var _context;
	var _req = new XMLHttpRequest();
	_req.timeout = 2000;
	var _on_load;
	var _on_closed;
	var _on_error;
	_req.onreadystatechange = function(){
	    switch(_req.readyState){
		case 3 : 
		if(typeof(_on_load) == 'function')
//		    console.log('loading');
//		    _on_load(this.responseText);
		break;

		case 4 :
		if(typeof(_on_closed) == 'function'){
//		    console.log('closed', this.responseText);		    
		    _on_closed();		
		}
	    }
	}
	function _pack_data_url(context, data){
	    if(context.method == 'GET')
		return  context.url + '?data=' + base32.encode(data);
	    return context.url;
	}
        return {
	    'send_once' : function(context, data, recv_cb, closed_cb, err_cb){
		_req.open(context.method, context.method == 'GET' ? _pack_data_url(context, data) : context.url,true);
		_req.onload = function(){ recv_cb(_req.responseText) };
		_req.send(data);
	    },
	    'open' : function(context){
		_req.overrideMimeType("text/plain; charset=x-user-defined");
		if(context.method == 'GET')
		    _context = context; //This hack need for data_url
		else
		    _req.open(context.method, context.url, true);
		//реализовать передачу типов, хотя это ещё касается поддежки типов данных и другими модулями, так что потом, а пока просто будем текст получать
	    },
	    'send' : function(data){
		if(_context)
		    _req.open(_context.method, _pack_data_url(_context, data), true);		    
		_req.send(data);
	    },
	    'close' : function(){
		_req.abort();
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