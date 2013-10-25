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
with(capsule.create()){
    test_uuid(uuid);
//    test_timer(timer);

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