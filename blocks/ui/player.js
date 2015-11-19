/*
 * common blocks for building audio or video player
 */

var animation = require('blocks/ui/animation');

//video frame without controls
exports.video = function (comp, info){
    var video = this.element = new comp.video(info);
    
    video.set_volume(0.2);
    this.source = null;    
    
    this.destroy = function(){
	video.destoy();
    };
};

function play_control(comp, player, parent){
    
}

//ui controls for player(play|pause, progressbar, volumecontrol etc)
exports.controls = function(comp, player, info){
    /*
     * common functionality
     */
    var self = this,
    controls_standby = 0;
    
    this.element = new comp.frame(info);

    /*
     * play|pause button
     */
    var play_b = new comp.button(
	{
	    x : '0%',
	    y : '0%',
	    width : '10%',
	    height : '100%',
	    z_index : 2,
	    label : 'play'
	}), 
    pause = true;

    this.element.add(play_b);
    function play(){
	player.element.play();
	play_b.set_label('pause');
	pause = false;				  			   
    }
    play_b.on_press(function(){
			controls_standby = 0;
			if(pause)
			    play();
			else {
			    player.element.pause();
			    play_b.set_label('play');
			    pause = true;
		       }
		    });

    /*
     * fullscreen button
     */
    var fullscreen_i = new comp.image(
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
    this.element.add(fullscreen_i);
    fullscreen_i.on('pointer_down', function(){
			fullscreen_pressed = true;
		    });
    fullscreen_i.on('pointer_up', function(){
			if(fullscreen_pressed){
			    fullscreen_pressed = false;
			    player.fullscreen.toggle();				
			}
		    });
    
    /*
     * progressbar
     */
    var timeline_f = new comp.frame(
	{
	    width : '84%',
	    height : '100%',
	    x : '11%',
	    y : '0%',
	    z_index : 2
	}
    ),
    timeline_i = new comp.image(
        {
            width : '100%',
            height : '30%',
            x : '0%',
            y : '35%',
            z_index : 1,
	    opacity : 1,

            source : require('images/blue')
        }),
    timepoint_i = new comp.image(
	{ 
	    x : '0%', 
	    y : '0%', 
	    width : '5%', 
	    height : '100%', 
	    opacity : '60%',
	    z_index : 2,

	    source : require('images/timepoint')
	}),
    current_position, position_step;;

    this.element.add(timeline_f);
    timeline_f.add(timeline_i);
    timeline_f.add(timepoint_i);
    var point_drag = false;
    player.element.on_timeupdate(function(){
				     if(player.element.get_duration() == player.element.get_position()){
					 //FIXME изменение кнопки play после окончания файла
				     }
				     if(point_drag)
					 return; //do nothing if a point was dragged
				     
				     if(typeof(position_step) == 'undefined')
					 position_step = player.element.get_duration() / 190;
				     current_position = Math.round(player.element.get_position() / position_step) / 2;
				     timepoint_i.change_props({ x : current_position });
				 });
    timeline_f.on('pointer_down', function(pointer_obj){
		      controls_standby = 0;
		      point_drag = true;
		  });
    timeline_f.on('pointer_motion', function(pointer_obj){
		      if(!point_drag)
			  return;
		      current_position = pointer_obj.shift().x,
		      timepoint_i.change_props({ x : current_position });
			});
    timeline_f.on('pointer_up', function(pointer_obj){
		      if(!point_drag)
			  return;
		      controls_standby = 0;
		      point_drag = false;
		      var current_position = Math.round(pointer_obj.shift().x);
		      player.element.set_position((player.element.get_duration() / 100) * current_position);
		      timepoint_i.change_props({ x : current_position });
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
    this.element.on('pointer_motion', function(){
	if(controls_standby >= 3)
	    self.appear.toggle();
	controls_standby = 0;
    });    

    this.destroy = function(){
	activity_timer.destroy();
	timeline_f.on('pointer_up');
	timeline_f.on('pointer_down');
	timeline_f.on('pointer_motion');
	player.on_timeupdate(function(){});
	timeline_f.remove(timepoint_i);
	timepoint_i.destroy();
	timeline_f.remove(timeline_i);
	timeline_i.destroy();
	this.element.remove(timeline_f);
	timeline_f.destroy();

	this.element.remove(play_b);
	play_b.destroy();

	this.element.remove(fullscreen_i);
	fullscreen_i.destroy();
	fullscreen_i.on('pointer_down');
	fullscreen_i.on('pointer_motion');
	fullscreen_i.on('pointer_up');
    };
};
