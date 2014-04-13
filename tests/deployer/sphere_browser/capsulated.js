exports.main = function(env){
    var capsule = env.capsule;
    var sloader = env.dsa.service_loader;

    var mqnode1 = env.dsa.mq.create(capsule);
    var mqnode2 = env.dsa.mq.create(capsule);
    mqnode1.activate({"transport" : "direct", "url": "blahe" },
		     {"transport" : "direct", "url": "blahc" }
		    );
    mqnode2.activate({"transport" : "direct", "url": "blaha" },
		     {"transport" : "direct", "url": "blahh" }
		    );
    mqnode1.node_add({"transport" : "direct", "url": "blahh" });
    mqnode2.node_add({"transport" : "direct", "url": "blahc" });

//    mqnode1.deactivate();
//    mqnode2.deactivate();
    var _mq = mqnode1;

    var ui = sloader.load('sphere/ui_elements', mqnode1, env);
    var frontend = sloader.load('sphere/frontend', mqnode1, env);
    var backend = sloader.load('sphere/backend', mqnode1, env);

    var sprout = capsule.modules.sequence;
    sprout.mq_send = _mq.send;

    sprout.run([
		   {
		       name : 'ui',
		       
		       action : ['s', ui, 'init'],
		       
		       next : [
			   {
			       action : ['s', backend, 'create'],
			   },
			   {
			       action : ['s', frontend, 'create', backend]   
			   }
		       ]
		   }
	       ]);

}
