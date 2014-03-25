var bb_allocator = require('../../../parts/bb_allocator.js');

var ids = new bb_allocator.create(bb_allocator.id_allocator);
var base32 = require('../../../dependencies/base32.js');

//неплохо бы подумать как это загружать и выгружать, без вот таких вот свидетельств:)
var head = document.getElementsByTagName('head')[0];
var script_tag = document.createElement('script');

script_tag.setAttribute('id', 'script_transport_data');
//reply callback array, краткость для экономии траффика:D
script_tag.innerHTML = 'var rca = []';
head.appendChild(script_tag);
    
function script_request(){
    var _on_recv,
    _on_close,
    _on_error,
    script_tag;

    function compose_request(context, data, recv_cb, closed_cb, err_cb){
	var id = ids.alloc();
	var head = document.getElementsByTagName('head')[0];
	script_tag = document.createElement('script');
	script_tag.setAttribute('id','s' + id);
	rca[id] = function(reply){
            head.removeChild(script_tag);
	    script_tag = null;
            ids.free(id);
            rca[id] = undefined;
	    _on_close();
	    //этот оверхед нужно будет пофиксить, а то как-то неверно получается:)
            recv_cb(JSON.stringify(reply));
	}
	//прилепить сюда ещё превышение времени ожидание по таймеру надобно:)
	return {
	    'activate' : function(data){
		//нужны проверки данных и передача данных
		var data_str = '';
		if(data)
		    data_str = 'data=' + base32.encode(data) + '&';
		script_tag.setAttribute('src',context.url + '?' + data_str + 'jsonp=rca[' + id + ']');
		head.appendChild(script_tag);
	    }
	};
    }

    this._req = undefined;
    
    this.send_once =function(context, data,  recv_cb, closed_cb, err_cb){
	    compose_request(arguments).activate();
	};
	
    this.open = function(context){
	    this._req = compose_request(context,null, _on_recv, _on_close, _on_error);
    };
    this.send = function(data){
	    this._req.activate(data);
    };
    
    this.close = function(){
	if(script_tag){		    
            head.removeChild(script_tag);
	    _on_closed();
	}
    };

    this.on_recv = function(callback){
	    _on_recv = callback;
    };

    this.on_close = function(callback){
	_on_close = callback;
    };

    this.on_error = function(callback){
	_on_error = callback;
    };	    
}

function xhr_request(){
    var _context;
    var _req = new XMLHttpRequest();
    _req.timeout = 2000;
    var _on_load;
    var _on_close;
    var _on_error;
    _req.onreadystatechange = function(){
	switch(_req.readyState){
	case 3 : 
	    if(typeof(_on_load) == 'function')
		//		    console.log('loading');
		//		    _on_load(this.responseText);
		break;

	case 4 :
	    if(typeof(_on_close) == 'function'){
		//		    console.log('closed', this.responseText);		    
		_on_close();		
	    }
	}
    }
    function _pack_data_url(context, data){
	if(context.method == 'GET')
	    return  context.url + '?data=' + base32.encode(data);
	return context.url;
    }

    this.send_once = function(context, data, recv_cb, closed_cb, err_cb){
	_req.open(context.method, context.method == 'GET' ? _pack_data_url(context, data) : context.url,true);
	_req.onload = function(){ recv_cb(_req.responseText) };
	_req.send(data);
    };

    this.open = function(context){
	_req.overrideMimeType("text/plain; charset=x-user-defined");
	if(context.method == 'GET')
	    _context = context; //This hack need for data_url
	else
	    _req.open(context.method, context.url, true);
	//реализовать передачу типов, хотя это ещё касается поддежки типов данных и другими модулями, так что потом, а пока просто будем текст получать
    };

    this.send = function(data){
	if(_context)
	    _req.open(_context.method, _pack_data_url(_context, data), true);		    
	_req.send(data);
    };

    this.close = function(){
	_req.abort();
	_on_close();
    };

    this.on_recv = function(callback){
	_on_load =_req.onload = function(){ recv_cb(_req.responseText) };
    };

    this.on_close = function(callback){
	_on_close =_req.ontimeout = callback;
    };
    
    this.on_error =  function(callback){
	_on_error = callback;
    }
    
    this.destroy = function(obj){
	obj._req.abort();
	obj._req = null;
	delete obj;
    };
}

exports.send = function(type, context, data,  data_cb, err_cb){
    var req = this.create(type);

    //for xhr, not for script allocator.free(xhr)
    req.send_once(context, data, function(data){
		      data_cb(data);
		      req.destroy();
		  }, err_cb);
}

exports.create = function(type){
    if(type == 'xhr')
	return new xhr_request();
    else 
	if(type == 'script')
	    return new script_request();    
}