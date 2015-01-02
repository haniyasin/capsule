var DEBUG = 1;

function slideup_cubes_test(comp){
    var image = comp.image_create({ x : 10, y : 10, width : 50, height : 50, opacity : 0.8});
    comp.frame_add(0, image);
    var green = comp.image_create({ x : 40, y : 40, width : 50, height : 50, opacity : 0.8,
				source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2D4zwAAAgIBANHTRkQAAAAASUVORK5CYII='});
    comp.frame_add(0, green);
    image = comp.image_create({ x : 70, y : 70, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image);
    var image1 = comp.image_create({ x : 100, y : 100, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image1);
    var red = comp.image_create({ x : 130, y : 130, width : 50, height : 50, opacity : 0.8,
				    source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY3growIAAycBLhVrvukAAAAASUVORK5CYII=' });
    comp.frame_add(0, red);
    var anim = comp.anim_create([
				    {
					duration : 1000,
					actions : {
					    x : 100
					}
				    },
				    {
					duration : 1000,
					actions : {
					    width : 100,
					    height : 100
					}
				    },
				    {
					duration : 500,
					actions : {
					    y : -50
					}
				    },
				    {
					duration : 500,
					actions : {
					    y : 50
					}
				    },
				    {
					duration : 1000,
					actions : {
					    width : -100,
					    height : -100
					}
				    },
				    {
					duration : 1000,
					actions : {
					    x : -100
					}
				    }
			    ]);

    var banim_red = comp.anim_bind(red, anim);
    var banim_green = comp.anim_bind(green, anim);
    var banim1 = comp.anim_bind(image1, anim);
    var banim = comp.anim_bind(0, anim);
    comp.anim_start(banim_red);
    comp.anim_start(banim_green);
    comp.anim_start(banim1);
    comp.anim_start(banim);
    comp.event_register(banim_red, 'animation_stopped', function(event_name) {
			    comp.anim_start(banim_red);
			    comp.anim_start(banim_green);
			    comp.anim_start(banim1);
			    comp.anim_start(banim);
			});  
    };

function original_test2(comp){
    var root = 0,

    frame = comp.frame_create(
        {
            width : '25%',
            height : '25%',

            x : '0%',
            y : '0%',

            z_index : '1'
        }
    ),

    image_red = comp.image_create(
        {
            width : '100%',
            height : '100%',

            x : '0%',
            y : '0%',

            z_index : '1',

            source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY3growIAAycBLhVrvukAAAAASUVORK5CYII='
        }
    ),

    image_green = comp.image_create(
        {
            width : '80%',
            height : '80%',

            x : '10%',
            y : '10%',

            z_index : '2',

            source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2D4zwAAAgIBANHTRkQAAAAASUVORK5CYII='
        }
    ),

    image_blue = comp.image_create(
        {
            width : '60%',
            height : '60%',

            x : '20%',
            y : '20%',

            z_index : '3',

            source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2Bg+A8AAQMBAKJTBdAAAAAASUVORK5CYII='
        }
    ),

    anim = comp.anim_create([
				{
				    duration : 1000,

				    actions :
				    {
					x : 75
				    }
				},
				{
				    duration : 1000,

				    actions :
				    {
					y : 75
				    }
				},
				{
				    duration : 1000,

				    actions :
				    {
					x : -75
				    }
				},
				{
				    duration : 1000,

				    actions :
				    {
					y : -75
				    }
				}
			    ]),

    bind = comp.anim_bind(frame, anim);

    comp.event_register(bind, 'animation_stopped', function(eventName, eventData){
			    comp.anim_start(bind);
			});

    comp.frame_add(frame, image_red);
    comp.frame_add(frame, image_green);
    comp.frame_add(frame, image_blue);

    comp.frame_add(root, frame);

    comp.anim_start(bind);
}

function original_test1(comp){
    var root = 0,

    frame = comp.frame_create(
        {
            width : '25%',
            height : '25%',

            x : '0%',
            y : '0%',

            z_index : '1'
        }
    ),

    image_red = comp.image_create(
        {
            width : '100%',
            height : '100%',

            x : '0%',
            y : '0%',

            z_index : '1',

            source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY3growIAAycBLhVrvukAAAAASUVORK5CYII='
        }
    ),

    image_green = comp.image_create(
        {
            width : '80%',
            height : '80%',

            x : '10%',
            y : '10%',

            z_index : '2',

            source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2D4zwAAAgIBANHTRkQAAAAASUVORK5CYII='
        }
    ),

    image_blue = comp.image_create(
        {
            width : '60%',
            height : '60%',

            x : '20%',
            y : '20%',

            z_index : '3',

            source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2Bg+A8AAQMBAKJTBdAAAAAASUVORK5CYII='
        }
    ),

    anim_right = comp.anim_create([
				      {
					  duration : 0,

					  actions :
					  {
					      x : 25
					  }
				      }
				  ]),

    anim_down = comp.anim_create([
				     {
					 duration : 0,

					 actions :
					 {
					     y : 25
					 }
				     }
				 ]),

    anim_left = comp.anim_create([
				     {
					 duration : 0,

					 actions :
					 {
					     x : -25
					 }
				     }
				 ]),

    anim_up = comp.anim_create([
				   {
				       duration : 0,

				       actions :
				       {
					   y : -25
				       }
				   }
			       ]),

    bind_right = comp.anim_bind(frame, anim_right);
    bind_down  = comp.anim_bind(frame, anim_down),
    bind_left  = comp.anim_bind(frame, anim_left),
    bind_up    = comp.anim_bind(frame, anim_up),

    animation = {
        counter : 0,
        animation : 0,

        animations :
        [
            bind_right,
            bind_down,
            bind_left,
            bind_up
        ],

        get : (function () {
                   if (this.counter++ === 3) {
                       this.counter = 1;

                       if (this.animation++ === 3) {
                           this.animation = 0;
                       }
                   }

                   return this.animations[this.animation];
               })
    };


    comp.event_register(frame, 'pointer_in', function(eventData){
			    comp.anim_start(animation.get());
			});

    comp.frame_add(frame, image_red);
    comp.frame_add(frame, image_green);
    comp.frame_add(frame, image_blue);
    
    comp.frame_add(root, frame);    
}

function create_move_remove_test(comp){    
    var rand = comp.image_create({ x : 70, y : 10, width : 50, height : 50, opacity : 0.8, z_index : 1}),
    green = comp.image_create({ width : '100%', height : '100%', opacity : 1, z_index : 1,
				source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2D4zwAAAgIBANHTRkQAAAAASUVORK5CYII='}),
    text = comp.text_create({ x : '10%', y : '5%', width : '80%', height : '90%', opacity : 0.9, text : 'haha'}),
    frame = comp.frame_create( { x : '5%', y : '5%', width : '50%', height : '50%', opacity : 0.5, z_index : 2 }),
    frame_t = comp.frame_create( { x : 40, y : 40, width : 50, height : 50, opacity : 0.8, z_index : 2 });
    comp.frame_add(frame_t, green);
    comp.frame_add(frame_t, text);

    var button = comp.button_create( { x : 70, y : 60, width : 100, height : 50, z_index : 1, label : 'click' });
    comp.button_get_control(button).on_press(function(){print('button is pressed')});
    var entry = comp.entry_create( { x : 40, y : 100, width : 150, height : 30, placeholder : 'печатайте что-нибудь' });
    comp.entry_get_control(entry).on_text_change(function(){print('text is changed')});

    comp.frame_add(frame, rand);
    comp.frame_add(frame, frame_t); 
    comp.frame_add(frame, button);
    comp.frame_add(frame, entry);
    comp.frame_add(0, frame);

    var anim = comp.anim_create([
				    {
					duration : 500,
					actions : {
					    y : 30,
					    x : 30,
					    width : 30,
					    height : 30
					}
				    },
				    {
					duration : 1000,
					actions : {
					    y : 20,
					    x : -30,
					    width : 100,
					    height : 50
					}
				    }
				]);

    comp.event_register(frame_t, 'pointer_in', function(event_data){
			   print('in', JSON.stringify(event_data)); 
			});
    comp.event_register(frame_t, 'pointer_out', function(event_data){
			   print('in', JSON.stringify(event_data)); 
			});
    comp.event_register(frame_t, 'pointer_down', function(event_data){
			   print('in', JSON.stringify(event_data)); 
			});
    comp.event_register(frame_t, 'pointer_up', function(event_data){
			   print('in', JSON.stringify(event_data)); 
			});

    var bind = comp.anim_bind(frame_t, anim);
    comp.anim_start(bind);

    comp.event_register(bind, 'animation_stopped', function(){
			    comp.frame_remove(0, frame);
			    comp.frame_destroy(frame);
			});
}

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

exports.test = function(){
    var comp = new (require('modules/ui/Compositer')).Compositer();

//    slideup_cubes_test(comp);   
//    original_test2(comp);
//    original_test1(comp);
//    create_move_remove_test(comp); //this test is depends of gjs
    video_player(comp);
};