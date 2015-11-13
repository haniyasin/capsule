/*
 * common blocks for building audio or video player
 */

var animation = require('blocks/ui/animation');

//video frame without controls
exports.video = function (comp, parent, frame_info, video_info){
    var frame = this.frame = comp.frame_create(frame_info),
    video = comp.video_create(video_info);
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

function play_control(comp, player, parent){
    
}

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
	    y : '10%', 
	    width : '3%', 
	    height : '80%', 
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
					      y : -6,
					      width : 2,
					      height : 8
					  }
				      }
				  ],
				  [
				      {
					  duration : 300,
					  actions : {
					      x : 1,
					      y : 6,
					      width : -2,
					      height : -8
					  } 
				      }
				  ]
				 ),
    fullscreen_pressed;
    
    fullscreen_at.bind(player);
    comp.frame_add(this.frame, fullscreen_i);
    comp.event_register(fullscreen_i, 'pointer_down', function(){
			    fullscreen_pressed = true;
			});
    comp.event_register(fullscreen_i, 'pointer_up', function(){
			    if(fullscreen_pressed){
				fullscreen_pressed = false;
				player.fullscreen.toggle();				
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
	    opacity : 1,

            source : require('images/blue')
        }),
    timepoint_i = comp.image_create(
	{ 
	    x : '0%', 
	    y : '0%', 
	    width : '5%', 
	    height : '100%', 
	    opacity : '80%',
	    z_index : 2,

	    source : require('images/timepoint')
	}),
    current_position, position_step;;

    comp.frame_add(this.frame, timeline_f);
    comp.frame_add(timeline_f, timeline_i);
    comp.frame_add(timeline_f, timepoint_i);

    var point_drag = false;
    player.vcontrol.on_timeupdate(function(){
				      if(player.vcontrol.get_duration() == player.vcontrol.get_position()){
					  //FIXME изменение кнопки play после окончания файла
				      }
				      if(point_drag)
					  return; //do nothing if a point was dragged

				      if(typeof(position_step) == 'undefined')
					  position_step = player.vcontrol.get_duration() / 190;
				      current_position = Math.round(player.vcontrol.get_position() / position_step) / 2;
				      comp.element_change_props(timepoint_i, { x : current_position });
				  });
    comp.event_register(timeline_f, 'pointer_down', function(pointer_obj){
			    controls_standby = 0;
			    point_drag = true;
			});
    comp.event_register(timeline_f, 'pointer_motion', function(pointer_obj){
			    if(!point_drag)
				return;
			    current_position = pointer_obj.shift().x,
			    comp.element_change_props(timepoint_i, { x : current_position });
			});
    comp.event_register(timeline_f, 'pointer_up', function(pointer_obj){
			    if(!point_drag)
				return;
			    controls_standby = 0;
			    point_drag = false;
			    var current_position = Math.round(pointer_obj.shift().x);
			    player.vcontrol.set_position((player.vcontrol.get_duration() / 100) * current_position);
			    comp.element_change_props(timepoint_i, { x : current_position });
			});

    var anim_appear = new animation.toggle(comp, 'appear', 
					  [
					      {
						  duration : 200,
						  actions : {
						      opacity : -100   
						  }
					      }
					  ],
					  [
					      {
						  duration : 200,
						  actions : {
						      opacity : 100
						  }
					      }
					  ]);
    anim_appear.bind(this);

    var activity_timer = require('modules/timer').create(function(){
							     if(controls_standby == 3 && !self.appear.toggled)
								 self.appear.toggle();
							     else
								 controls_standby += 1;								      }, 1000, true);
    comp.event_register(this.frame, 'pointer_motion', function(){
			    if(controls_standby >= 3)
				self.appear.toggle();
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
	comp.event_unregister(fullscreen_i, 'pointer_motion');
	comp.event_unregister(fullscreen_i, 'pointer_up');
    };
};
