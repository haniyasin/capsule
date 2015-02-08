/*
 * common blocks for building audio or video player
 */

var animation = require('blocks/ui/animation');

//video frame without controls
exports.video = function (comp, parent, info){
    var frame = this.frame = comp.frame_create(info),
    video = comp.video_create({ x : '0%', y : '0%', 
				width : '100%', height : '100%', 
				z_index : 2});
    comp.frame_add(frame, video);
    comp.frame_add(parent.frame, frame);
    
    this.vcontrol = comp.video_get_control(video),
    this.vcontrol.set_volume(0.2);
    this.source = null;    
    
    this.destroy = function(){
	comp.frame_remove(video);
	comp.video_destroy(video);
	comp.frame_destroy(frame);
    };
};

//ui controls for player(play|pause, progressbar, volumecontrol etc)
exports.controls = function(comp, player, parent, info){
    var self = this,
    frame_timeline = comp.frame_create(
	{
	    width : '89%',
	    height : '100%',
	    x : '11%',
	    y : '0%',
	    z_index : 2
	}
    ),
    playb = comp.button_create(
	{
	    x : '0%',
	    y : '0%',
	    width : '10%',
	    height : '100%',
	    z_index : 2,
	    opacity : 0.9,
	    label : 'play'
	}),
    image_timeline = comp.image_create(
        {
            width : '100%',
            height : '30%',
            x : '0%',
            y : '35%',
            z_index : 2,

            source : require('images/blue')
        }),
    image_timepoint = comp.image_create(
	{ 
	    x : '0%', 
	    y : '0%', 
	    width : '5%', 
	    height : '100%', 
	    opacity : 0.8,
	    z_index : 2,

	    source : require('images/timepoint')
	});
    this.frame = comp.frame_create(info);
    comp.frame_add(parent.frame, this.frame);
    comp.frame_add(this.frame, playb);
    comp.frame_add(this.frame, frame_timeline);
    comp.frame_add(frame_timeline, image_timeline);
    comp.frame_add(frame_timeline, image_timepoint);

    var playc = comp.button_get_control(playb),
    pause = true,
    controls_standby = 0;

    function play(){
	player.vcontrol.play();
	playc.set_label('pause');
	pause = false;				  			   
    }
    playc.on_press(function(){
		       controls_standby = 0;
		       if(pause){
			   if(player.source == null){
			       player.file_opener.setup(function(address){
							    player.source = address;
							    player.vcontrol.load(player.source);
							    player.slide.off();
							    play();
							});
			       player.slide.on();
			       return;
			   }
			   play();
		       } else {
			   player.vcontrol.pause();
			   playc.set_label('play');
			   pause = true;
		       }
		   });

    var step, prev_step = 0, position_step;;
    player.vcontrol.on_timeupdate(function(){
			       if(typeof(position_step) == 'undefined')
				   position_step = player.vcontrol.get_duration() / 200;
			       step = Math.round(player.vcontrol.get_position() / position_step)/2;
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
			    controls_standby = 0;
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
			    controls_standby = 0;
			    point_drag = false;
			    step = pointer_obj.shift().x;
			    ///			    print('eee', prev_step, step, (vcontrol.get_duration() / 100) * step);
			    player.vcontrol.set_position((player.vcontrol.get_duration() / 100) * step);
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

    var anim_appear = new animation.toggle(comp, 'appear', 
					  [
					      {
						  duration : 300,
						  actions : {
						      opacity : -100   
						  }
					      }
					  ],
					  [
					      {
						  duration : 300,
						  actions : {
						      opacity : 100
						  }
					      }
					  ]);
    anim_appear.bind(this);

    var activity_timer = require('modules/timer').create(function(){
							     if(controls_standby == 3 && !self.appear.toggled)
								 self.appear.on();
							     else
								 controls_standby += 1;					     
				      }, 1000, true);
    comp.event_register(this.frame, 'pointer_motion', function(){
			    if(controls_standby >= 3)
				self.appear.off();
			    controls_standby = 0;
			});    

    this.destroy = function(){
	activity_timer.destroy();
	comp.event_unregister(frame_timeline, 'pointer_up');
	comp.event_unregister(frame_timeline, 'pointer_down');
	comp.event_unregister(frame_timeline, 'pointer_motion');
	player.vcontrol.on_timeupdate(function(){});

	comp.frame_remove(image_timepoint);
	comp.image_destroy(image_timepoint);
	comp.frame_remove(image_timeline);
	comp.image_destroy(image_timeline);
	comp.frame_remove(frame_timeline);
	comp.frame_destroy(frame_timeline);
	comp.frame_remove(playb);
	comp.button_destroy(playb);
    };
};
