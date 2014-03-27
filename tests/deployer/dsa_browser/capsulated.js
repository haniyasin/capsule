exports.main = function(env){
    var capsule = env.capsule;
    var sloader = env.dsa.service_loader;

    console.log(JSON.stringify(env.dsa));
    var mqnode1 = env.dsa.mq.create(capsule);
    var mqnode2 = env.dsa.mq.create(capsule);
    var mqnode3 = env.dsa.mq.create(capsule);
    var mqnode4 = env.dsa.mq.create(capsule);
    
    mqnode1.activate({"transport" : "direct", "url": "blahe" },
		     {"transport" : "direct", "url": "blahc" }
		    );
    mqnode2.activate({"transport" : "direct", "url": "blaha" },
		     {"transport" : "direct", "url": "blahh" }
		    );
    mqnode3.activate({"transport" : "direct", "url": "blaht" },
		     {"transport" : "direct", "url": "blahy" }
		    );
    mqnode4.activate({"transport" : "direct", "url": "blahp" },
		     {"transport" : "direct", "url": "blahq" }
		    );

    mqnode1.node_add({"transport" : "direct", "url": "blahq" });
    mqnode2.node_add({"transport" : "direct", "url": "blaht" });
    mqnode4.node_add({"transport" : "direct", "url": "blahh" });
    mqnode2.node_add({"transport" : "direct", "url": "blahc" });

    mqnode3.on_msg('dfdfdfswww', function(msg){
		       console.log('node3 is printing', msg);
		       mqnode3.send('dfdfdfswwe', 'приветы');
		   })
    mqnode1.send('dfdfdfswww', 'привето');
    mqnode4.send('dfdfdfswww', 'привету');

    mqnode1.on_msg('dfdfdfswwe', function(msg){
		       console.log('node1 is printing', msg);
		   })
    mqnode2.send('dfdfdfswww', 'привеф');
    mqnode3.send('dfdfdfswwe', 'приветп');
    mqnode2.send('dfdfdfswwe', 'приветр');

//    mqnode1.deactivate();
//    mqnode2.deactivate();
//    mqnode3.deactivate();
//    mqnode4.deactivate();

//    var _mq = env.dsa.mq.create(capsule);
   
//    _mq.activate();
    var _mq = mqnode1;
    var sid = sloader.load('tests/test_set/service_one', mqnode1, env);    
    _mq.send(sid, [null, "set", "gg", "ttte"]);
    _mq.send(sid, [null, "ping", "ttt"]);
    _mq.send(sid, [null, "pong", "tttg"]);
    _mq.send(sid, [null, "init", "ttta"]);

    var seq = env.capsule.modules.sequence;
    seq.mq_send = _mq.send;
    
    seq.sequence(['s', sid, 'set', 'gg', 'ttte'],
	     ['s', sid, 'get', 'gg'],
	     ['ff', function(next, stack, sequence){
		  console.log(stack);
		  stack.push('hai');
		  stack.last = 'hai';
	      }],
		 ['ff', function(next ,stack, sequence){
		      console.log(stack.last);
		  }]);
}
