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

    var ui = {
    }
    ui.label = sloader.load('dsa/services/ui/overlay/label', mqnode1, env);    
    ui.button = sloader.load('dsa/services/ui/overlay/button', mqnode1, env);    
    ui.entry = sloader.load('dsa/services/ui/overlay/entry', mqnode1, env);
    ui.panel = sloader.load('dsa/services/ui/overlay/panel', mqnode1, env);
    
    var address_panel = sloader.load('sphere/ui/address_panel', mqnode1, env);
    var action_panel = sloader.load('sphere/ui/action_panel', mqnode1, env);

    var seq = capsule.modules.sequence;
    seq.mq_send = _mq.send;

    seq.run([
		{
		    action : ['s', address_panel, 'create', ui]
		},
		{
		    action : ['s', action_panel, 'create', ui]   
		}
	    ]);
}
