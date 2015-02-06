/*
 * Example Player application based on capsule API(ui, io)
 */

function file_open_form(comp, parent_frame){
    var form_frame = this.frame = comp.frame_create({
					   x : '0%',
					   y : '-90%',
					   width : '100%',
					   height : '90%',
					   opacity : 1,
					   z_index : 1
				       }),
    bg = comp.image_create({
			       x : '0%',
			       y : '0%',
			       width : '100%',
			       height : '100%',
			       opacity : 1,
			       z_index : 1,
			       source : require('images/file_form_bg')
			   }),
    text = comp.text_create({
				x : '0%',
				y : '0%',
				width : '100%',
				height : '30%',
				z_index : 2,
				text : 'выберите файл или перетащите его сюда'
			    }),
    addre = comp.entry_create({
				  x : '5%',
				  y : '30%',
				  width : '80%',
				  height : '65%',
				  z_index : 2,
				  placeholder : "http://docs.gstreamer.com/media/sintel_trailer-480p.ogv"
			      }),
    addrc = comp.entry_get_control(addre),
    okb = comp.button_create({
				 x : '85%',
				 y : '30%',
				 width : '10%',
				 height : '65%',
				 z_index : 2,
				 label : 'ok'
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
    comp.frame_add(form_frame, bg);
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

function controls_widget(comp, player, video, info){
    var playb = comp.button_create({
				       x : '0%',
				       y : '0%',
				       width : '10%',
				       height : '100%',
				       z_index : 2,
				       opacity : 0.9,
				       label : 'play'
				   }),
    frame_timeline = comp.frame_create(
	{
	    width : '89%',
	    height : '100%',
	    x : '11%',
	    y : '0%',
	    z_index : 2
	}
    ),
    image_timeline = comp.image_create(
        {
            width : '100%',
            height : '100%',

            x : '0%',
            y : '0%',

            z_index : 2,

            source : require('images/blue')
        }),
    image_timepoint = comp.image_create(
	{ 
	    x : '0%', 
	    y : '0%', 
	    width : '4%', 
	    height : '100%', 
	    opacity : 0.8,
	    z_index : 2,
	    source : require('images/red')
	}),
    vcontrol = comp.video_get_control(video);    
    this.frame = comp.frame_create(info);
    comp.frame_add(this.frame, playb);
    comp.frame_add(this.frame, frame_timeline);
    comp.frame_add(frame_timeline, image_timeline);
    comp.frame_add(frame_timeline, image_timepoint);

    var playc = comp.button_get_control(playb);
    var pause = true;

    function play(){
	vcontrol.play();
	playc.set_label('pause');
	pause = false;				  			   
    }
    playc.on_press(function(){
		       if(pause){
			   if(source == null){
			       addr_form.setup(function(address){
						   source = address;
						   vcontrol.load(source);
						   player.up();
						   addr.up();
//						   comp.anim_start(player_banimslu);
						   //						   comp.anim_start(addr_banimslu);
						   play();
					       });
			       player.down();
			       addr.down();
//			       comp.anim_start(player_banimsld);
//			       comp.anim_start(addr_banimsld);
			       return;
			   }
			   play();
		       } else {
			   vcontrol.pause();
			   playc.set_label('play');
			   pause = true;
		       }
		   });
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

function video_player(comp){
    var player_frame = comp.frame_create({ x : '0%', y : '0%', 
					   width : '100%', height : '100%', 
					   z_index : 2}),
    bg_image = comp.image_create({
				     x : '0%', y : '0%',
				     width : '100%', height : '100%',
				     z_index : 1,
				     source : require('images/main_bg')
				}),
    video = comp.video_create({ x : '0%', y : '1%', 
				width : '100%', height : '89%', 
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
    controls = new controls_widget(comp, video, {
				x : '1%',
				y : '88%',
				width : '98%',
				height : '10'
			    });    

    comp.frame_add(player_frame, bg_image);
    comp.frame_add(player_frame, video);
    comp.frame_add(player_frame, controls.frame);
    comp.frame_add(player_frame, drag_dest.id);
    comp.frame_add(0, player_frame);

    var anim_slide_down = comp.anim_create([
					       {
						   duration : 300,
						   actions : {
						       y : 90   
						   }
					       }
					   ]),
    anim_slide_up = comp.anim_create([
					 {
					     duration : 300,
					     actions : {
						 y : -90
					     } 
					 }
				     ]),
    player_banimslu = comp.anim_bind(player_frame, anim_slide_up),
    player_banimsld = comp.anim_bind(player_frame, anim_slide_down),
    addr_banimslu = comp.anim_bind(addr_form.frame, anim_slide_up),
    addr_banimsld = comp.anim_bind(addr_form.frame, anim_slide_down);

    
    drag_dest.on('motion', function(context, x, y){
		     return true;
		 });
    drag_dest.on('drop', function(context, x, y){
		     return true;
		 });
    drag_dest.on('data', function(context, x, y){
		     source = context.data;
		     vcontrol.load(source);
		 });

    vcontrol.set_volume(0.2);
}

exports.main = function(){
    var Compositer = require('modules/ui/Compositer');
    require('modules/ui/dnd');//подключаем возможности dnd в Compositer

//    print(JSON.stringify(Compositer));
    var comp = Compositer.create();
    video_player(comp);
};
