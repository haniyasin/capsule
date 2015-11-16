/*
 * Example Player application based on capsule API(ui, io)
 */

var tfile, comp, animation,
    bplayer, work_zone_switcher;

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
		     work_zone_switcher.toggle();
		 });

    this.destroy = function(){
	drag_dest.destroy();
    };
}

function playlist(player, info){
    var form_frame = this.frame = comp.frame_create(info),
    bg = comp.image_create({
			       x : '0%',
			       y : '0%',
			       width : '100%',
			       height : '100%',
			       z_index : 0,
			       source : require('images/file_form_bg')
			   });

    comp.frame_add(form_frame, bg);
    comp.frame_add(0, form_frame);
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
		       work_zone_switcher.toggle();
//		      file_choosen(new tfile(addr_c.get_value()));
		 });

//    var file_opener = new file_opener_widget(comp, player.video, player.video, ),
    dnd = new dnd_widget(comp, player.frame, {
			     x : '0%',
			     y : '0%',
			     width : '100%',
			     height : '80%',
			     opacity : 0.1,
			     z_index : 0
			 });    
}

function player(info){ 
    var self = this,
    video = this.video = new bplayer.video(comp,{
						   x : '0%', y : '0%',
						   width : '100%', height : '100%', 
						   z_index : 1
					       }),
    controls = new bplayer.controls(comp, video, {
					x : '23%',
					y : '88%',
					width : '47%',
					height : '10%',
					z_index : 1
				    }),
    bg = comp.image_create({
			       x : '0%', y : '0%',
			       width : '100%', height : '100%',
			       z_index : 0,
			       source : require('images/main_bg')
			   }),
    sanim = new animation.toggle(comp, 'slide',
				 [
				     {
					 duration : 300,
					 actions : {
					     x : -21,
					     width : 22
					 }
				     }
				 ],
				 [
				     {
					 duration : 300,
					 actions : {
					     x : 21,
					     width : -22,
					     z_index : 1
					 } 
				     }
				 ]
				);
    this.frame = comp.frame_create(info);
    sanim.bind(this);
//    return;
//    comp.frame.add(this.frame, controls.frame);
    comp.frame_add(this.frame, bg);
    comp.frame_add(0, this.frame);
    comp.event_register(bg, 'pointer_down', function(){
			    work_zone_switcher.toggle();
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
    var iplayer = new player({
				x : '37%', y : '0%',
				width : '62%', height : '100%',
				z_index : 2
			    }),
        iplaylist =  new playlist(iplayer, {
				      x : '1%',
				      y : '0%', 
				      width : '35%',
				      height : '100%',
				      opacity : 1,
				      z_index : 1
				  });

    work_zone_switcher = new animation.many_toggle(comp,
	[{
	     elements : [iplayer.frame],
	     on : [
		 {
		   duration : 200,
		     actions : {
			 x : -20
		     }  
		 },
		 {
		     duration : 300,
		     actions : {
			 x : -16,
			 width : 36
		     }
		 }
	     ],
	     off : [
		 {
		   duration : 200,
		     actions : {
			 x : 20
		     }  		     
		 },
		 {
		     duration : 300,
		     actions : {
			 x : 16,
			 width : -36,
			 z_index : 1
		     } 
		 }
	     ]
	 },
	 {
	     elements : [iplaylist.frame],
	     on : [
		 {
		     duration : 300,
		     actions : {
			 x : 10,
			 y : 10,
			 width : -20,
			 height : -20
		     }
		 }
	     ],
	     off : [
		 {
		     duration : 300,
		     actions : {
			 x : -10,
			 y : -10,
			 width : 20,
			 height : 20
		     } 
		 }
	     ]
	 }
	]);
};
