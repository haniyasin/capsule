var DEBUG = 1;

exports.test = function(capsule){
    var comp = capsule.modules.ui.Compositer.create();
    
    var image = comp.image_create({ x : 10, y : 10, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image);
    image = comp.image_create({ x : 40, y : 40, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image);
    image = comp.image_create({ x : 70, y : 70, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image);
    image = comp.image_create({ x : 100, y : 100, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image);
    image = comp.image_create({ x : 130, y : 130, width : 50, height : 50, opacity : 0.8 });
    comp.frame_add(0, image);
}