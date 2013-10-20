var http = require('http');
var fs = require('fs');
var URL = require('url');
function xhr_srv_context(){
    
    var _http = {
	/*
	 * srvs item is object
	 * {
	 *     online - boolean
	 *     handlers - array of objects { url, callback(req, reply_cb) }
	 * }
	 */
	srvs : {  },
	
	/*
	 * @url -- virtual host + path
	 * @callback
	 * @listen_host -- a host to listen. Аргумент может отсутствовать, нужен тогда, когда , url не имеет отображения на какой-либо ip этого сервера(то есть если использовано прокси или балансирующие прокси). 
	 */
	handler_register : function (url, callback, listen_host){
//	    if(srvs[port] == )
	}
    }
    
    
    //один контекст может управлять множеством http серверов, и привязывать к каждому множество обработчиков
    //разных адресов(подобно виртуал хостинг, но не совсем для этого:))
    var http_server = http.createServer(function(req, res){
					var reply_cb;
					var req_type_exp = new RegExp("(.*)\\?jsonp=([\\w\\[\\]]+)");
					//					console.log(req.url);
					//создание регекспа
					//проверка регекспом url
					//если находится jsonp, то jsonp заворот ответа
					var ret_parts = req_type_exp.exec(req.url);
					console.log(req.url);
					if(ret_parts.length == 3){
					    reply_cb = function(reply){
						res.writeHead(200, {
								  'Content-Type' : 'application/javascript', 
								  'Cache-Control' : 'no-cache'
							      });
						res.end(ret_parts[2] + '(' + JSON.stringify(reply) + ')');
					    }
					} 
					//в противном случае другой заворот.
					else if (ret_parts.length == 2) {
					    reply_cb = function(reply){
						res.writeHead(200, {
								  'Content-Type' : 'application/javascript', 
								  'Cache-Control' : 'no-cache'
							      });
						res.end(JSON.stringify(reply));
					    }
					    this.on_request(reply_cb);
					}
					
				    });
    //тут надо бы вытащить порт из адреса, а пока 8081
//   http_server.listen(address);

    /*
     * конструктор объекта on_request
     * Создаёт http сервер, если надо, и привязывает к нему обработчик определённого url
     * callback(req_data, reply_cb)
     */
    this.on_request = function(url, callback){
	var _url = URL.parse(url);
	console.log(JSON.stringify(_url));
	
    }

}

function common_bidirectional_message_interface(){
    this.send = function(url, data){
    }
//    this.on_recv = function(url, func(url, data)){
 //   }    
}

function http_bidi_msg_srv(){
    this.send = function(url, data){
    }
//    this.on_recv = function(url, func(url, data)){
//    }    
}

var req_context = new xhr_srv_context();

req_context.on_request('http://2du.ru:8081/tata/g', function(){});