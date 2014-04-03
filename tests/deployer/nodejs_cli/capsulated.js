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

    function do_service(){
	
    }

    function sprout(sprout, trace){
	if(typeof(trace) == undefined)
	    trace = {};

	for(element in sprout){
	    if(sprout[element].hasOwnProperty('name'))
		console.log('name is ', sprout[element].name);

	    if(sprout[element].hasOwnProperty('type'))
		switch(sprout){
		    case 'service' : 
		    
		    break;
		    
		    case 'near_f' :
		    break;

		    case 'far_f' : 
		    break;
		}
	    

	}
    }

    service.panel.create({
			     width : '50%',
			     height : '50%'    
			 }).sprout = {
			     name : 'panel_main',
			     next : function(sprout){
				 service.button.create({
							   width : '20%',
							   height : '10%'			    
						       }).sprout = {
							   next : function(sprout){
							       sprout.panel_main.add(sprout.parent);   
							   }
						       };
				 service.entry.create({
							  width : '30%',
							  height : '10%'    
						      }).sprout = {
							  next : function(sprout){
							      
							  }
						      }; 
			     }
			 };

    var sprout = [
	{
	    name : 'main_panel',

	    type : 'service',
	    target : 1,
	    msg : 'create',
	    
	    args : [
		{
		    width : '50%',
		    height : '50%'    
		}
	    ],

	    next : [
		{
		    type : 'service',
		    target : 2,
		    msg : 'create',

		    args : [
			{
			    width : '20%',
			    height : '10%'			    
			}
		    ],
		    
		    next : [
			{
			    type : 'service',
			    msg : 'add',
			    target : 'main_panel',

			    args : [
				'parent'
			    ]
			}
		    ]
		},
		{
		    type : 'service',
		    msg : 'create',
		    target : 3,

		    args : [
			{
			    width : '30%',
			    height : '10%'    
			}
		    ],
		    
		    next : [
			{
			    type : 'service',
			    msg : 'add',
			    target : 'main_panel',

			    args : [
				'parent'
			    ]
			}
		    ]
		}
	    ]
	}
    ]

    console.log(sprout[0].next);
}
