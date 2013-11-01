/* Test for capsule common properties
 * 
 */

var capsule = require('../capsule.js');
var DEBUG = 1;

function test_timer(timer){
    console.log("starting testing of timer module");

    //проверить наличие таймер модуля и его пригодность
    //подумать о том как проверить неработоспособность destroy
    //testing of timer's cyclic mode
    var start_seconds = (new Date()).getSeconds();
    var counter = 0;
    var seconds_left = 0;
    var interval = 50; //milisec
    var timeout = 4; //seconds
    var _timer  = timer.js.create(function(){
//				     console.log(print++);
				     var cur_seconds =  (new Date()).getSeconds();
				     start_seconds <= cur_seconds ? seconds_left = cur_seconds - start_seconds : seconds_left = 60 - start_seconds + cur_seconds;
				     counter++;
				     if(seconds_left >= timeout){
					 _timer.destroy();
					 if(DEBUG)
					     console.log("DEBUG: seconds_left[",seconds_left,"], counter[", counter,"], start_seconds[", start_seconds, "], cur_seconds[", cur_seconds,"]");
					 if(counter > timeout*1000/interval*0.6)
					     console.log("test of cyclic mode [PASSED]");
					 else
					     console.log("test of cyclic mode [FAILED]");
				     }
				 }, interval, true);

    //testing of timer's single timeout mode

    var timeout_counter = 0;    
    for(var ind = 0; ind < 200; ind++){
	timer.js.create(function(timeout){
			    //				      timeout.destroy();
			    timeout_counter++;
			}, interval + ind, false);	
	if(ind == 199)
	    timer.js.create(function(){
				if(DEBUG)
				    console.log("DEBUG: timeout_counter[",timeout_counter,']');
				if(timeout_counter == 200)
				    console.log("test of single timeout mode [PASSED]");
				else
				    console.log("test of single timeout mode [FAILED]");
			    },5000,false);
    }    
}

function test_uuid(uuid){
    var uuid_s = uuid.node.generate_str();
    var uuid_n = uuid.node.parse(uuid_s);
    console.log(uuid_s, uuid_n, uuid.node.unparse(uuid_n));
}

function test_transport(transport){
    console.log("timer module's testing is started...")
    //создаём транспорт, для каждого вида транспорта по своему

    var d = transport.direct.create('blah', transport.features.dealer);
    var r = transport.direct.create('blah', transport.features.router);

    var d1 = transport.direct.create('blahe', transport.features.dealer);
    var d2 = transport.direct.create('blahe', transport.features.dealer);
    var d3 = transport.direct.create('blahe', transport.features.dealer);
    var r1 = transport.direct.create('blahe', transport.features.router);    

    var returnsumm = 0;
    var controlsumm = 0;

    //a test of the single dealer and a recustion call
    for(var ind = 1; ind < 4; ind++){
	d.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		   returnsumm += JSON.parse(body).counter;
	       });
    }

    r.on_msg(0, function(id, body){
		 r.send(id, body);
	     })

    for(var ind = 1; ind < 11; ind++){
	controlsumm += ind;
	d.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		   returnsumm += JSON.parse(body).counter;
	       });
    }

    if(controlsumm == returnsumm){
	if(DEBUG)
	    console.log("DEBUG: controlsumm[", controlsumm, "], returnsumm[", returnsumm, ']');
	console.log("a test of the single dealer and a recustion call [PASSED]");
    }

    //a test of the multiple dealers and recustion calls
    controlsumm = 0;
    returnsumm = 0;
    r1.on_msg(0, function(id, body){
		 r1.send(id, body);
	     })

    for(var ind = 1; ind < 40; ind++){
	controlsumm += ind;
	d1.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		   returnsumm += JSON.parse(body).counter;
	       });
    }

    //deep callback trace
    for(var ind = 1; ind < 20000; ind++){
	controlsumm += ind;
	d2.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		    d2.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
				d2.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
					    d2.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
							returnsumm += JSON.parse(body).counter;
						    });
					});
	            });
	       });
    }
    for(var ind = 1; ind < 200; ind++){
	controlsumm += ind;
	d3.send(ind, JSON.stringify({'haha' : 'ha', 'counter' : ind }), function(id, body){
		   returnsumm += JSON.parse(body).counter;
	       });
    }

    
    if(controlsumm == returnsumm){
	if(DEBUG)
	    console.log("DEBUG: controlsumm[", controlsumm, "], returnsumm[", returnsumm, ']');
	console.log("a test of the multiple dealers and recustion calls [PASSED]");
    }


}

function test_http_respondent(http_replier){
    http_respondent.node.on_recv({ 'url' : "http://blah.com:8080/bro"}, function(context, response){
				  response.end("<html><body><h1>Hello</h1></body></html>");
			      }, function(error){console.log('failed', error)})
    http_respondent.node.on_recv({ 'url' : "http://blah.com:8080/brog"}, function(context, response){
				  response.end("<html><body><h1>Hellog</h1></body></html>");
			      }, function(error){console.log('failed', error)})
    http_respondent.node.on_recv({ 'url' : "http://blah.com:8080/broz"}, function(context, response){
				  response.end("<html><body><h1>Helloz</h1></body></html>");
			      }, function(error){console.log('failed', error)})
    http_respondent.node.on_recv({ 'url' : "http://raketa.net:8900/broty/haha/fofo"}, function(context, response){
				  response.end("<html><body><h1>Hellot</h1></body></html>");
			      }, function(error){console.log('failed', error)})
    http_respondent.node.on_recv({ 'url' : "http://localhost:8081/fafa"}, function(context, response){
				  response.end("<html><body><h1>Helly</h1></body></html>");
			      }, function(error){console.log('failed', error)})
}

with(capsule.create()){
//    test_uuid(uuid);
//    test_timer(timer);
//    test_transport(transport);
    test_http_respondent(http_respondent);
//    timer = timer.js.create()

    /*with(nc){
    var tdr = transport.direct.create("13", transport_features.router);
    var tdd = transport.direct.create("13", transport_features.dealer);
    //tdd.on_msg(12, function(id, body){console.log('figg', body, id)});
    tdr.on_msg(12,function(id, body){
		   console.log(id, body); 
		   tdr.send(12, "hai");
				    });
    tdd.send(12, "figa");
    tdd.send(12, "miga", function(id, body){console.log(body, id)});
    tdd.send(12, "giga");

    var mq1 = new mq(nc,['direct', 'ch1']);
    var mq2 = new mq(nc,['direct', 'ch2']);
    var mq3 = new mq(nc,['direct', 'ch3']);
    
    mq1.peer_add(['direct', 'ch3']);
    mq2.peer_add(['direct', 'ch1']);


//    var timer = timer.node.create(function(){console.log('dfdf')}, 2000);
//    var routers = new Array;
//    for(var ind in transport){
//	if(transport[ind].features & transport_features.router){
//	    console.log(transport[trans].create);
//	    routers = transport[ind].create('tcp://127.0.0.1:27000');		    
//	}
 //   }
}


//create, destroy, get_class, register, unregister



//function get_class_timer(){
//    return {
//	set : function(milisec, callback){}
//    }
//}

//function register_timer(timer_class){
//    
//}

*/

}