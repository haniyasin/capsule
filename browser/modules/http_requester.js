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
	return {
	    '_req' : new XMLHttpRequest(),
	    'send' : function(context, data, data_cb, err_cb){
		var xhr = this._req;
		this._req.onload = function(){ data_cb(xhr) };
		this._req.open(context.method, context.url,true);
		this._req.send();	
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
exports.send = function(context, data,  data_cb, err_cb){
    var xhr = script_allocator.alloc();
    //for xhr, not for script allocator.free(xhr)
    xhr.send(context, '', function(_xhr){ data_cb(_xhr.responseText); });
}