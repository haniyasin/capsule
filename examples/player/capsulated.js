/*
 * Example Player application based on capsule API(ui, io)
 */

function file_open_form(comp, parent_frame){
    var form_frame = comp.frame_create({
					   x : '10%',
					   y : '20%',
					   width : '80%',
					   height : '60%',
					   opacity : 1,
					   z_index : 1
				       }),
    text = comp.text_create({
				x : '0%',
				y : '0%',
				width : '100%',
				height : '30%',
				text : 'выберите файл или перетащите его сюда'
			    }),
    addre = comp.entry_create({
				  x : '0%',
				  y : '30%',
				  width : '90%',
				  height : '70%',
				  placeholder : "http://docs.gstreamer.com/media/sintel_trailer-480p.ogv",
				  z_index : 2
			      }),
    addrc = comp.entry_get_control(addre),
    okb = comp.button_create({
				 x : '90%',
				 y : '30%',
				 width : '10%',
				 height : '70%',
				 label : 'ok',
				 z_index : 2
			     }),
    okc = comp.button_get_control(okb),
    anim_show = comp.anim_create([
					   {
					       duration : 1000,
					       actions : {
						   opacity : 0   
					       }
					   }
				       ]),
    anim_hide = comp.anim_create([
					 {
					     duration : 300,
					     actions : {
						 opacity : 1
					     } 
					 }
				     ]),
    banimshow = comp.anim_bind(form_frame, anim_show),
    banimhide = comp.anim_bind(form_frame, anim_hide),    
    setup_callback;

    addrc.set_value("http://docs.gstreamer.com/media/sintel_trailer-480p.ogv");
    comp.frame_add(form_frame, text);
    comp.frame_add(form_frame, addre);
    comp.frame_add(form_frame, okb);
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
    alert('data:image/svg+xml;base64,' + require('images/main_bg'));
    var player_frame = comp.frame_create({ x : '0%', y : '0%', 
					   width : '100%', height : '100%', 
					   z_index : 2}),
    bg_image = comp.image_create({
				     x : '0%', y : '0%',
				     width : '100%', height : '100%',
				     z_index : 1,
				     source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2Bg+A8AAQMBAKJTBdAAAAAASUVORK5CYII='
//				     source : 'data:image/svg+xml;base64,' + require('images/main_bg')
				}),
    video = comp.video_create({ x : '0%', y : '0%', 
				width : '100%', height : '90%', 
				z_index : 2, opacity : 1}),
    drag_dest = comp.dnd_destination_create({
						x : '0%',
						y : '0%',
						width : '100%',
						height : '100%',
						opacity : 0.1,
						z_index : 1
					    }, null, null, null),
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
	    width : '89%',
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

            z_index : 2,

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

    comp.frame_add(player_frame, bg_image);
    comp.frame_add(player_frame, video);
    comp.frame_add(player_frame, drag_dest.id);
    comp.frame_add(player_frame, playb);
    comp.frame_add(player_frame, frame_timeline);
    comp.frame_add(frame_timeline, image_timeline);
    comp.frame_add(frame_timeline, image_timepoint);
    comp.frame_add(0, player_frame);

    var anim_slide_down = comp.anim_create([
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
    banimslu = comp.anim_bind(player_frame, anim_slide_up),
    banimsld = comp.anim_bind(player_frame, anim_slide_down);

    var playc = comp.button_get_control(playb);
    var pause = true;

    function play(){
	vcontrol.play();
	playc.set_label('pause');
	pause = false;				  			   
    }
    
    drag_dest.on('motion', function(context, x, y){
		     return true;
		 });
    drag_dest.on('drop', function(context, x, y){
		     return true;
		 });
    drag_dest.on('data', function(context, x, y){
		     source = context.data;
		     vcontrol.load(source);
//		     play();
		 });

    playc.on_press(function(){
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
			   vcontrol.pause();
			   playc.set_label('play');
			   pause = true;
		       }
		   });
    vcontrol.set_volume(0.2);
    var step, prev_step = 0, position_step;;
    vcontrol.on_timeupdate(function(){
			       if(typeof(position_step) == 'undefined')
				    position_step = vcontrol.get_duration() / 200;
			       step = Math.round(vcontrol.get_position() / position_step)/2;
			       if(step > prev_step || step < prev_step){
				   var inc_anim = comp.anim_create([
								       {
									   duration : 0,
									   actions : {
									       x : step - prev_step
									   }
								       }
								   ]);
//				   alert(point_to_slide);
				   comp.anim_start(comp.anim_bind(image_timepoint, inc_anim));
				   prev_step = step;
			       }
			   });
    var point_drag = false, drag_prev_step;
    comp.event_register(frame_timeline, 'pointer_down', function(pointer_obj){
			    point_drag = true;
			    drag_prev_step = prev_step;
			});
    comp.event_register(frame_timeline, 'pointer_motion', function(pointer_obj){
			    if(!point_drag)
				return;
			    var drag_step = pointer_obj.shift().x,
			    timepoint_slide_anim = comp.anim_create([
									{
									    duration : 0,
									    actions : {
										x : drag_step - drag_prev_step
									    }
									}
								    ]);
			    comp.anim_start(comp.anim_bind(image_timepoint, timepoint_slide_anim));
			    drag_prev_step = drag_step;
			});
    comp.event_register(frame_timeline, 'pointer_up', function(pointer_obj){
			    if(!point_drag)
				return;
			    point_drag = false;
			    step = pointer_obj.shift().x;
///			    print('eee', prev_step, step, (vcontrol.get_duration() / 100) * step);
			    vcontrol.set_position((vcontrol.get_duration() / 100) * step);
			    var timepoint_slide_anim = comp.anim_create([
									    {
										duration : 300,
										actions : {
										    x : step - prev_step
										}
									    }
									]);
			    comp.anim_start(comp.anim_bind(image_timepoint, timepoint_slide_anim));
			    prev_step = step;
			});
}

exports.main = function(){
    var Compositer = require('modules/ui/Compositer');
    require('modules/ui/dnd');//подключаем возможности dnd в Compositer

//    print(JSON.stringify(Compositer));
    var comp = Compositer.create();
    video_player(comp);
//    alert(require('images/main_bg'));
};
