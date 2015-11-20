/*
 * Example Player application based on capsule API(ui, io)
 */

var tfile, comp, animation,
    bplayer, work_zone_switcher;
/*
function file_opener_widget(comp, player, parent, info){


    function file_choosen(file){
//	console.log(address);
	player.source = file;
	player.load(file);
	player.slide.toggle();
    }


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
*/

function list_element(index){
    var frame = this.element = new comp.frame({
						  x : '1%', y : (5 + index*8) + '%',
						  width : '96%', height : 1, z_index : 1 
					      }),
    delim = new comp.image({
			       x : 0, y : 0,
			       width : '100%', height : '100%', z_index : 1,
			       source : require('images/blue')
			   });
    frame.add(delim);
}

function playlist(player, info){
    var frame = this.element = new comp.frame(info),
    bg = new comp.image({
			    x : '0%', y : '0%',
			    width : '100%', height : '100%',z_index : 0,
			    source : require('images/file_form_bg')
			}),
    title = new comp.text({
			      x : '1%', y : '1%',
			      width : '98%', height : '10%', z_index : 1,
			      text : 'Filelist'
			  });
    frame.add(bg);
    var index = 1;
    frame.add((new list_element(index++)).element);
    frame.add((new list_element(index++)).element);
    frame.add((new list_element(index++)).element);
    frame.add((new list_element(index++)).element);
    frame.add((new list_element(index++)).element);
    frame.add((new list_element(index++)).element);
    frame.add((new list_element(index++)).element);
    frame.add((new list_element(index++)).element);
    frame.add((new list_element(index++)).element);
    frame.add((new list_element(index++)).element);
    frame.add(title);
    comp.root.add(frame);
    var add_b = new comp.button({
				    x : '1%', y : '93%',
				    width : '30%', height : '6%', z_index : 2,
				    label : 'add'
				});
    frame.add(add_b);
    add_b.on_press(function(){
		       work_zone_switcher.toggle();
		       //		      file_choosen(new tfile(addr_c.get_value()));
		   });
/*
    var file_opener = new file_opener_widget(comp, player.video, player.video, ),
    dnd = new dnd_widget(comp, player.frame, {
			     x : '0%',
			     y : '0%',
			     width : '100%',
			     height : '80%',
			     opacity : 0.1,
			     z_index : 0
			 });    */
}

function player(info){
    this.element = new comp.frame(info); 
    var self = this,
    video = this.video = new bplayer.video(comp,{
						   x : '1%', y : '1%',
						   width : '98%', height : '98%', 
						   z_index : 1
					       }),
    controls = new bplayer.controls(comp, video, {
					x : '2%',
					y : '88%',
					width : '96%',
					height : '10%',
					z_index : 5
				    }),
    bg = new comp.image({
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
    sanim.bind(this);
    this.element.add(bg);
    this.element.add(video.element);
    this.element.add(controls.element);
    comp.root.add(this.element);
    bg.on('pointer_down', function(){
	      work_zone_switcher.toggle();
	  });
}

exports.main = function(){
    if(!tfile)
	tfile = require('types/file');
    var Compositer = require('modules/ui/Compositer');
    require('modules/ui/dnd');//подключаем возможности dnd в Compositer
//    require('modules/ui/filechooser'); //подключаем возможности filechooser
    comp = new Compositer();
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
	     elements : [iplayer.element],
	     on : [
		 {
		   duration : 200,
		     actions : {
			 x : -20
		     }  
		 },
		 {
		     duration : 100,
		     actions : {
			 x : -16,
			 width : 36
		     }
		 }
	     ],
	     off : [
		 {
		     duration : 100,
		     actions : {
			 x : 16,
			 width : -36,
			 z_index : 1
		     } 
		 },
		 {
		   duration : 200,
		     actions : {
			 x : 20
		     }  		     
		 }
	     ]
	 },
	 {
	     elements : [iplaylist.element],
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
