var DEBUG = 1;

exports.test = function(capsule){
    var comp = capsule.modules.ui.Compositer.create();
    
    var image = comp.image_create();
    comp.frame_add(0, image);
}