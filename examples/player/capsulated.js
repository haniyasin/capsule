function video_player(comp){
    var player_frame = comp.frame_create({ x : '10%', y : '10%', width : '80%', height : '80%'}),
    video = comp.video_create({ x : 0, y : 0, width : '100%', height : '100%', z_index : 1, opacity : 1}),
    vcontrol = comp.video_get_control(video),
    playb = comp.button_create({
				       x : '5%',
				       y : '94%',
				       width : '10%',
				       height : '7%',
				       z_index : 2,
				       opacity : 0.7,
				       label : 'начать'
				   }),
    pauseb = comp.button_create({
				       x : '85%',
				       y : '94%',
				       width : '10%',
				       height : '7%',
				       z_index : 2,
				       opacity : 0.7,
				       label : 'пауза'
				   }),
    backwardb = comp.button_create({
				      x : '40%',
				      y : '95%',
				      width : '10%',
				      height : '10%',
				      z_index : 2,
				      opacity : 0.7,
				      label : 'назад'
				  }),
    forwardb = comp.button_create({
				       x : '50%',
				       y : '95%',
				       width : '10%',
				       height : '10%',
				       z_index : 2,
				       opacity : 0.7,
				       label : 'вперёд'
				   }),
    frame_timeline = comp.frame_create(
	{
	    width : '68%',
	    height : '6%',
	    x : '16%',
	    y : '94%',
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
    comp.frame_add(player_frame, pauseb);
//    comp.frame_add(player_frame, forwardb); 
//    comp.frame_add(player_frame, backwardb);
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
    banimsu = comp.anim_bind(player_frame, anim_size_up),
    banimsd = comp.anim_bind(player_frame, anim_size_down);

    comp.button_get_control(playb).on_press(function(){
						comp.anim_start(banimsu);
						vcontrol.play();
					    });
    comp.button_get_control(pauseb).on_press(function(){
						 comp.anim_start(banimsd);
						 vcontrol.pause();
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
//    comp.button_get_control(forwardb).on_press(function(){vcontrol.set_position(vcontrol.get_position() + 5000);});
//    comp.button_get_control(backwardb).on_press(function(){vcontrol.set_position(vcontrol.get_position() - 5000);});
}

exports.main = function(){
    var comp = (require('modules/ui/Compositer')).create();

    video_player(comp);
};
