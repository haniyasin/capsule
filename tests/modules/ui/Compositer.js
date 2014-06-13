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
			    print('mugaga');
				     comp.anim_start(bind);
			});

    comp.frame_add(frame, image_red);
    comp.frame_add(frame, image_green);
    comp.frame_add(frame, image_blue);

    comp.frame_add(root, frame);

    comp.anim_start(bind);
}

exports.test = function(capsule){
    var comp = capsule.modules.ui.Compositer.create();
    slideup_cubes_test(comp);    
    original_test2(comp);
};