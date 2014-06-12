var DEBUG = 1;

exports.test = function(capsule){
    var comp = capsule.modules.ui.Compositer.create();
    
    var image = comp.image_create({ x : 10, y : 10, width : 50, height : 50, opacity : 0.8,
				    source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY3growIAAycBLhVrvukAAAAASUVORK5CYII='});
    comp.frame_add(0, image);
    image = comp.image_create({ x : 40, y : 40, width : 50, height : 50, opacity : 0.8,
				source : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY2D4zwAAAgIBANHTRkQAAAAASUVORK5CYII='});
    comp.frame_add(0, image);
    image = comp.image_create({ x : 70, y : 70, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image);
    var image1 = comp.image_create({ x : 100, y : 100, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image1);
    image = comp.image_create({ x : 130, y : 130, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image);
    var anim = comp.anim_create([
				    {
					duration : 1000,
					actions : {
					    x : 200
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
					    x : -200
					}
				    }
			    ]);

    var banim1 = comp.anim_bind(image1, anim);
    var banim = comp.anim_bind(0, anim);
    comp.anim_start(banim1);
    comp.anim_start(banim);
    const GLib = imports.gi.GLib;
    print(GLib.base64_encode('lalaltttt'));
    comp.event_register(image1, 'animation_stopped', function(event_name) {print('uhaha', event_name)});
}