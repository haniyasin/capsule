/* Test for capsule common properties
 * 
 */

var fs = require('fs');

var capsule = require('../capsule.js');
var DEBUG = 1;


function test_uuid(uuid){
    var uuid_s = uuid.node.generate_str();
    var uuid_n = uuid.node.parse(uuid_s);
    console.log(uuid_s, uuid_n, uuid.node.unparse(uuid_n));
}


with(capsule.create()){
//    test_uuid(uuid);
//    test_timer(timer);
//    test_transport(transport);
    var hr = require('./http_respondent.js');
    hr.test(http_respondent);
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