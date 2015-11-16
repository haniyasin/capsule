/*
 * Example Player application based on capsule API(ui, io)
 */

var tfile, comp, animation,
    bplayer;

function file_opener_widget(comp, player, parent, info){
    /*
     * common functionality
     */

    function file_choosen(file){
//	console.log(address);
	player.source = file;
	player.vcontrol.load(file);
	player.slide.toggle();
    }

    /*
     * link entering
     */
    var addr_e = comp.entry_create({
				   x : '2%',
				   y : '30%',
				   width : '96%',
				   height : '20%',
				   z_index : 2,
				   placeholder : "http://docs.gstreamer.com/media/sintel_trailer-480p.ogv"
			       }),
    addr_c = comp.entry_get_control(addr_e);

    comp.frame_add(form_frame, addr_e);
    addr_c.set_value("http://docs.gstreamer.com/media/sintel_trailer-480p.ogv");

    /*
     * choosing local file
     */
    var filechooser = comp.filechooser_create({
					      x : '2%',
					      y : '51%',
					      width : '96%',
					      height : '20%',
					      z_index : 2,
					      label : 'Возьмите файлег'
				     });
    comp.frame_add(form_frame, filechooser.id);
    filechooser.on_choose(function(file){
			      file_choosen(file);
			  });
    /*
     * dnd file
     */

    /*
     * finishing choosing file
     */
}

function dnd_widget(comp, player, info){
    var drag_dest = comp.dnd_destination_create(info, null, null, null);
    this.frame = drag_dest.id;

    comp.frame_add(player.frame, drag_dest.id);

    drag_dest.on('motion', function(context, x, y){
		     return true;
		 });
    drag_dest.on('drop', function(context, x, y){
		     return true;
		 });
    drag_dest.on('data', function(context, x, y){
		     player.vcontrol.load(player.source = context.file);
		     player.slide.toggle();
		 });

    this.destroy = function(){
	drag_dest.destroy();
    };
}

function playlist(player){
    var form_frame = this.frame = comp.frame_create({
					     x : '1%',
					     y : '0%', 
					     width : '20%',
					     height : '100%',
					     opacity : 1,
					     z_index : 1
					 }),
    bg = comp.image_create({
			       x : '0%',
			       y : '0%',
			       width : '100%',
			       height : '100%',
			       z_index : 0,
			       source : require('images/file_form_bg')
			   });

    comp.frame_add(form_frame, bg);
    comp.frame_add(player.video.frame, form_frame);

    var add_b = comp.button_create({
				  x : '1%',
				  y : '84%',
				  width : '30%',
				  height : '15%',
				  z_index : 2,
				  label : 'add'
			     }),
    add_c = comp.button_get_control(add_b);
    comp.frame_add(form_frame, add_b);
    add_c.on_press(function(){
		       player.video.slide.toggle();
//		      file_choosen(new tfile(addr_c.get_value()));
		 });
    // parent.file_opener = this;
    return;
//    var file_opener = new file_opener_widget(comp, player.video, player.video, ),
    dnd = new dnd_widget(comp, player.video, {
			     x : '0%',
			     y : '0%',
			     width : '100%',
			     height : '80%',
			     opacity : 0.1,
			     z_index : 0
			 });    
}

function player(){ 
    var video = this.video = new bplayer.video(comp, {frame : 0}, 
					       {
						   x : '0%', y : '0%',
						   width : '200%', height : '100%'
					       },
					       {
						   x : '22%', y : '0%', //101 
						   width : '48%', height : '100%', 
						   z_index : 1
					       }),
    controls = new bplayer.controls(comp, video, video, {
					x : '22%',
					y : '95%',
					width : '50%',
					height : '5%',
					z_index : 1
				    }),    
    sanim = new animation.toggle(comp, 'slide',
				 [
				     {
					 duration : 300,
					 actions : {
					     x : -43   
					 }
				     }
				 ],
				 [
				     {
					 duration : 300,
					 actions : {
					     x : 43
					 } 
				     }
				 ]
				);
    sanim.bind(video);
    var bg = comp.image_create({
				   x : '22%', y : '0%',
				   width : '48%', height : '100%',
				   z_index : 0,
				   source : require('images/main_bg')
			       });
    comp.frame_add(this.video.frame, bg);
    comp.event_register(bg, 'pointer_down', function(){
			    video.slide.toggle();
			});
}

exports.main = function(){
    if(!tfile)
	tfile = require('types/file');
    var Compositer = require('modules/ui/Compositer');
    require('modules/ui/dnd');//подключаем возможности dnd в Compositer
    require('modules/ui/filechooser'); //подключаем возможности filechooser
    comp = Compositer.create();
    animation = require('blocks/ui/animation');
    bplayer = require('blocks/ui/player');
    
    new playlist(new player());
};
