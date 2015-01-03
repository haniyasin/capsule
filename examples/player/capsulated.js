function file_open_form(comp, parent_frame){
    var form_frame = comp.frame_create({
					   x : '10%',
					   y : '10%',
					   width : '80%',
					   height : '20%',
					   opacity : '100%',
					   z_index : 1
				       }),
    okb = comp.button_create({
				 x : '90%',
				 y : '0%',
				 width : '10%',
				 height : '100%',
				 label : 'ok'
			     }),
    okc = comp.button_get_control(okb),
    addre = comp.entry_create({
				  x : '0%',
				  y : '0%',
				  width : '90%',
				  height : '100%',
				  placeholder : "http://docs.gstreamer.com/media/sintel_trailer-480p.ogv"
			      }),
    addrc = comp.entry_get_control(addre),
    anim_show = comp.anim_create([
					   {
					       duration : 1000,
					       actions : {
						   opacity : -100   
					       }
					   }
				       ]),
    anim_hide = comp.anim_create([
					 {
					     duration : 300,
					     actions : {
						 opacity : 100
					     } 
					 }
				     ]),
    banimshow = comp.anim_bind(form_frame, anim_show),
    banimhide = comp.anim_bind(form_frame, anim_hide),    
    setup_callback;

    addrc.set_value("http://docs.gstreamer.com/media/sintel_trailer-480p.ogv");
    comp.frame_add(form_frame, okb);
    comp.frame_add(form_frame, addre);
    comp.frame_add(parent_frame, form_frame);
    okc.on_press(function(){
		     comp.anim_start(banimhide);
		     if(typeof(setup_callback) != undefined)
			 setup_callback(addrc.get_value());
		 });
    
    this.setup = function(callback){
	setup_callback = callback;
	comp.anim_start(banimshow);
    };
}

function video_player(comp){
    var player_frame = comp.frame_create({ x : '10%', y : '10%', width : '80%', height : '80%', z_index : 2}),
    video = comp.video_create({ x : 0, y : 0, width : '100%', height : '90%', z_index : 1, opacity : 1}),
    vcontrol = comp.video_get_control(video),
    addr_form = new file_open_form(comp, 0),
    source = null,
    playb = comp.button_create({
				       x : '0%',
				       y : '90%',
				       width : '10%',
				       height : '10%',
				       z_index : 2,
				       opacity : 0.9,
				       label : 'play'
				   }),
    frame_timeline = comp.frame_create(
	{
	    width : '90%',
	    height : '8%',
	    x : '10%',
	    y : '91%',
	    z_index : 2
	}
    ),
    image_timeline = comp.image_create(
        {
            width : '100%',
            height : '30%',

            x : 0,
            y : '35%',

            z_index : 1,

            source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2Bg+A8AAQMBAKJTBdAAAAAASUVORK5CYII='
        }),
    image_timepoint = comp.image_create(
	{ 
	    x : '0%', 
	    y : 0, 
	    width : '2%', 
	    height : '100%', 
	    opacity : 0.8,
	    z_index : 2,
	    source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY3growIAAycBLhVrvukAAAAASUVORK5CYII=' 
	});

    
    comp.frame_add(player_frame, video);
    comp.frame_add(player_frame, playb);
    comp.frame_add(player_frame, frame_timeline);
    comp.frame_add(frame_timeline, image_timeline);
    comp.frame_add(frame_timeline, image_timepoint);
    comp.frame_add(0, player_frame);

    var anim_size_up = comp.anim_create([
					    {
						duration : 300,
						actions : {
						    x : -10,
						    y : -10,
						    width : 20,
						    height : 20
						}
					    }
					]),
    anim_size_down = comp.anim_create([
					    {
						duration : 300,
						actions : {
						    x : 10,
						    y : 10,
						    width : -20,
						    height : -20
						}
					    }
					]),
    anim_slide_down = comp.anim_create([
					   {
					       duration : 300,
					       actions : {
						   y : 30   
					       }
					   }
				       ]),
    anim_slide_up = comp.anim_create([
					 {
					     duration : 300,
					     actions : {
						 y : -30
					     } 
					 }
				     ]),
    banimsu = comp.anim_bind(player_frame, anim_size_up),
    banimsd = comp.anim_bind(player_frame, anim_size_down),
    banimslu = comp.anim_bind(player_frame, anim_slide_up),
    banimsld = comp.anim_bind(player_frame, anim_slide_down);

    var playc = comp.button_get_control(playb);
    var pause = true;
    playc.on_press(function(){
		       function play(){
			   comp.anim_start(banimsu);
			   vcontrol.play();
			   playc.set_label('pause');
			   pause = false;				  			   
		       }
		       if(pause){
			   if(source == null){
			       addr_form.setup(function(address){
						   source = address;
						   vcontrol.load(source);
						   comp.anim_start(banimslu);
						   play();
					       });
			       comp.anim_start(banimsld);
			       return;
			   }
			   play();
		       } else {
			   comp.anim_start(banimsd);
			   vcontrol.pause();
			   playc.set_label('play');
			   pause = true;
		       }
		   });
    vcontrol.set_volume(0.2);
    var timepoint = 0;
    vcontrol.on_timeupdate(function(){
			       var point_to_slide = Math.round(vcontrol.get_position() / (vcontrol.get_duration() / 100));
			       if(point_to_slide > timepoint){
				   var position_change_anim = comp.anim_create([
										   {
										       duration : 0,
										       actions : {
											   x : point_to_slide
										       }
										   }
									       ]);
//				   alert(point_to_slide);
				   comp.anim_start(comp.anim_bind(image_timepoint, position_change_anim));
				   timepoint += point_to_slide;				   
			       }
			   });
    comp.event_register(frame_timeline, 'pointer_down', function(pointer_obj){
			    var new_timepoint = pointer_obj.shift().x;
			    vcontrol.set_position(vcontrol.get_duration() / 100 * new_timepoint);
			    var timepoint_slide_anim = comp.anim_create([
									    {
										duration : 300,
										actions : {
										    x : new_timepoint - timepoint
										}
									    }
									]);
			    comp.anim_start(comp.anim_bind(image_timepoint, timepoint_slide_anim));
			    timepoint = new_timepoint;
			});
}

exports.main = function(){
    var comp = (require('modules/ui/Compositer')).create();

    video_player(comp);
};
