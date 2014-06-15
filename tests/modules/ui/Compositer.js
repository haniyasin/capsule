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
			    print('uhaha', event_name)
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
    frame = comp.frame_create( { x : '5%', y : '5%', width : '50%', height : '50%', opacity : 0.5 }),
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
					    y : -30,
					    x : -30,
					    width : -30,
					    height : -30
					}
				    }
				]),
    bind = comp.anim_bind(frame, anim);
    comp.anim_start(bind);
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
    comp.event_register(bind, 'animation_stopped', function(){
//			    comp.frame_remove(0, frame);
//			    comp.frame_destroy(frame);
			});
}

exports.test = function(capsule){
    var comp = capsule.modules.ui.Compositer.create();
//    slideup_cubes_test(comp);   
//    original_test2(comp);
//    original_test1(comp);
    create_move_remove_test(comp);
};