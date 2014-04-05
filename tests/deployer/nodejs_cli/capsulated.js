exports.main = function(env){
    var capsule = env.capsule;
    var mtests = capsule.tests.modules;
    
//    capsule.tests.modules.transport.direct.test(capsule);
//    capsule.tests.modules.timer.test(capsule);
//    mtests.http_requester.test(capsule);
    var thsocket = capsule.tests.modules.transport.http.socket_cli;
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule.modules);

    var thttp = capsule.tests.modules.transport.http.client;

//    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o', 'method' : 'POST'}, capsule);    

    var sprout = [
	{
	    name : 'main_panel',
	    
	    action : ['s', 1, 'create', {
				  width : '50%',
				  height : '50%'    
			      }],

	    next : [
		{
		    action : ['s', 2, 'create', {
				  width : '20%',
				  height : '10%'    
			      }],
		    next : [
			{
			    action : ['s', 'main_panel', 'add', 'parent']
			}
		    ]
		},
		{
		    action : ['s', 3, 'create',{
				  width : '30%',
				  height : '10%'    
			      }],
		    
		    next : [
			{
			    action : ['s', 'main_panel', 'add', 'parent']
			}
		    ]
		}
	    ]
	}
    ]

    var seq = capsule.modules.sequence;

    var fs = require('fs');
    sprout = [
	{
	    name : 'star',
	    action : ['c', fs.readFile, 'start'],

	    next : [
		{
		    'action' : ['f', function(stack, sprout_pusher){
				    console.log(stack.star[1].toString());
				}]   
		}
	    ]
	},
	{
	    action : ['f', function(stack, sprout_pusher){
			  stack.first = 'last';
			  }],
	    next : [
		{
		    action : ['f', function(stack, sprout_pusher){
				  console.log(stack.first);
			      }]
		}
	    ]
	},
    ]

    seq.run(sprout, {});

//    console.log(sprout[0].next);
}
