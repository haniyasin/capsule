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
    /*
     * common functionality
     */
    var self = this,
    controls_standby = 0;
    
    this.frame = comp.frame_create(info);
    comp.frame_add(parent.frame, this.frame);

    /*
     * play|pause button
     */
    var play_b = comp.button_create(
	{
	    x : '0%',
	    y : '0%',
	    width : '10%',
	    height : '100%',
	    z_index : 2,
	    opacity : 0.9,
	    label : 'play'
	}), 
    playc = comp.button_get_control(play_b),
    pause = true;

    comp.frame_add(this.frame, play_b);
    function play(){
	player.vcontrol.play();
	playc.set_label('pause');
	pause = false;				  			   
    }
    playc.on_press(function(){
		       controls_standby = 0;
		       if(pause)
			   play();
		       else {
			   player.vcontrol.pause();
			   playc.set_label('play');
			   pause = true;
		       }
		   });

    /*
     * fullscreen button
     */
    var fullscreen_i = comp.image_create(
	{
	    x : '96%', 
	    y : '0%', 
	    width : '4%', 
	    height : '100%', 
	    z_index : 2,

	    source : require('images/red')	    
	}
    ),
    fullscreen_at = new animation.toggle(comp, 'fullscreen',
				  [
				      {
					  duration : 300,
					  actions : {
					      x : -1,
					      y : -1,
					      width : 2,
					      height : 2
					  }
				      }
				  ],
				  [
				      {
					  duration : 300,
					  actions : {
					      x : 1,
					      y : 1,
					      width : -2,
					      height : -2
					  } 
				      }
				  ]
				 ),
    fullscreen = false, fullscreen_pressed;
    
    fullscreen_at.bind(player);
    comp.frame_add(this.frame, fullscreen_i);
    comp.event_register(fullscreen_i, 'pointer_down', function(){
			    fullscreen_pressed = true;
			});
    comp.event_register(fullscreen_i, 'pointer_up', function(){
			    if(fullscreen_pressed && fullscreen == false){
				fullscreen = true;
				player.fullscreen.on();
			    }else if(fullscreen_pressed && fullscreen == true){
				fullscreen = false;
				player.fullscreen.off();
			    }
			});
    
    /*
     * progressbar
     */
    var timeline_f = comp.frame_create(
	{
	    width : '84%',
	    height : '100%',
	    x : '11%',
	    y : '0%',
	    z_index : 2
	}
    ),
    timeline_i = comp.image_create(
        {
            width : '100%',
            height : '30%',
            x : '0%',
            y : '35%',
            z_index : 2,

            source : require('images/blue')
        }),
    timepoint_i = comp.image_create(
	{ 
	    x : '0%', 
	    y : '0%', 
	    width : '5%', 
	    height : '100%', 
	    opacity : 0.8,
	    z_index : 2,

	    source : require('images/timepoint')
	}),
    step, prev_step = 0, position_step;;

    comp.frame_add(this.frame, timeline_f);
    comp.frame_add(timeline_f, timeline_i);
    comp.frame_add(timeline_f, timepoint_i);

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
				   comp.anim_start(comp.anim_bind(timepoint_i, inc_anim));
				   prev_step = step;
			       }
			   });
    var point_drag = false, drag_prev_step;
    comp.event_register(timeline_f, 'pointer_down', function(pointer_obj){
			    controls_standby = 0;
			    point_drag = true;
			    drag_prev_step = prev_step;
			});
    comp.event_register(timeline_f, 'pointer_motion', function(pointer_obj){
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
			    comp.anim_start(comp.anim_bind(timepoint_i, timepoint_slide_anim));
			    drag_prev_step = drag_step;
			});
    comp.event_register(timeline_f, 'pointer_up', function(pointer_obj){
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
			    comp.anim_start(comp.anim_bind(timepoint_i, timepoint_slide_anim));
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
	return;
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
	comp.event_unregister(timeline_f, 'pointer_up');
	comp.event_unregister(timeline_f, 'pointer_down');
	comp.event_unregister(timeline_f, 'pointer_motion');
	player.vcontrol.on_timeupdate(function(){});
	comp.frame_remove(timepoint_i);
	comp.image_destroy(timepoint_i);
	comp.frame_remove(timeline_i);
	comp.image_destroy(timeline_i);
	comp.frame_remove(timeline_f);
	comp.frame_destroy(timeline_f);

	comp.frame_remove(play_b);
	comp.button_destroy(play_b);

	comp.frame_remove(fullscreen_i);
	comp.image_destroy(fullscreen_i);
	comp.event_unregister(fullscreen_i, 'pointer_down');
	comp.event_unregister(fullscreen_i, 'pointer_down');
    };
};
