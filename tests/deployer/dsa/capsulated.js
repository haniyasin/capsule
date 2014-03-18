exports.main = function(env){
    var capsule = env.capsule;

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
		       mqnode3.msg('dfdfdfswwe', 'привет');
		   })
    mqnode1.msg('dfdfdfswww', 'привет');
    mqnode4.msg('dfdfdfswww', 'привет');

    mqnode1.on_msg('dfdfdfswwe', function(msg){
		       console.log('node1 is printing', msg);
		   })
    mqnode2.msg('dfdfdfswww', 'привет');
    mqnode3.msg('dfdfdfswwe', 'привет');
    mqnode2.msg('dfdfdfswwe', 'привет');

    mqnode1.deactivate();
    mqnode2.deactivate();
    mqnode3.deactivate();
    mqnode4.deactivate();
}
