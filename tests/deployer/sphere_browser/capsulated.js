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
    ui.button = sloader.load('dsa/services/ui/overlay/button', mqnode1, env);    
    ui.entry = sloader.load('dsa/services/ui/overlay/entry', mqnode1, env);
    ui.panel = sloader.load('dsa/services/ui/overlay/panel', mqnode1, env);
    
    var address_panel = sloader.load('sphere/ui/address_panel', mqnode1, env);

    var seq = capsule.modules.sequence;
    seq.mq_send = _mq.send;

    seq.run([
		   {
		      action : ['s', address_panel, 'create', ui]
		   }
	       ]);

    
/*
    var ui_sprout = [
	{
	    name : 'panel',
	    
	    action : ['s', panel, 'create',
		      {
			  "x" : '5%',
			  "y" : '5%',
			  "width" : "80%" ,
			  "height" : "80%",
			  "orientation" : "bottom"
		      }],
	    
	    next : [
		{
		    action : ['s', swiper, 'create', {
				  x : 0,
				  y : 0,
				  width : '100%',
				  height : '100%',
			      },
			      'panel']  
		},
		{
		    action : ['s', button, 'create', {
				  "label" : "go",
				  "x" : "79%",
				  "y" : "2%",
				  "width" : "20%",
				  "height" : "20%",
				  
				  "on_pressed" : [
				      {
					  action : ['f', function(stack, sprout_pusher){
							stack.push(stack.last = 'ttt');
						    }]
				      },
				      {
					  action : ['f', function(stack, sprout_pusher){
							console.log(stack.last);
							console.log('eeee');
						    }]
				      }
				  ]
			      },
			      'panel'
		    ]		    
		},
		{
		    action : ['s', button, 'create',{
				  "label" : "uhlala",
				  "x" : "79%",
				  "y" : "78%",
				  "width" : "20%",
				  "height" : "20%",
				  
				  "on_pressed" : [
				      {
					  action : ['f', function(stack, sprout_pusher){
							console.log('gobutton is pressed');
						    }]	  
				      }
				  ]
			      }, 'panel'
			     ]	    
		},
		{
		    action : ['s', entry, 'create',
			      {
				  "x" : "1%",
				  "y" : "2%",
				  "width" : "77%",
				  "height" : "20%",
				  
				  "on_text_change" : [
				      {
					  action : ['f', function(stack, sprout_pusher){
							console.log(stack.text);
						    }]
				      }
				  ]
			      }, 'panel'
			     ]    
		}
	    ]
	}
    ]

    seq.run(ui_sprout);
*/
/*    var sid = sloader.load('tests/test_set/service_one', mqnode1, env);    
    _mq.send(sid, [null, "set", "gg", "ttte"]);
    _mq.send(sid, [null, "ping", "ttt"]);
    _mq.send(sid, [null, "pong", "tttg"]);
    _mq.send(sid, [null, "init", "ttta"]);
*/
}
