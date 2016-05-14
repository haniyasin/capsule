/*
 * Example Player application based on capsule API(ui, io)
 */

var tfile, ui, animation,
    bplayer, work_zone_switcher;
/*
function file_opener_widget(ui, player, parent, info){


    function file_choosen(file){
//	console.log(address);
	player.source = file;
	player.load(file);
	player.slide.toggle();
    }


    var addr_e = ui.entry_create({
				   x : '2%',
				   y : '30%',
				   width : '96%',
				   height : '20%',
				   z_index : 2,
				   placeholder : "http://docs.gstreamer.com/media/sintel_trailer-480p.ogv"
			       }),
    addr_c = ui.entry_get_control(addr_e);

    ui.frame_add(form_frame, addr_e);
    addr_c.set_value("http://docs.gstreamer.com/media/sintel_trailer-480p.ogv");


    var filechooser = ui.filechooser_create({
					      x : '2%',
					      y : '51%',
					      width : '96%',
					      height : '20%',
					      z_index : 2,
					      label : 'Возьмите файлег'
				     });
    ui.frame_add(form_frame, filechooser.id);
    filechooser.on_choose(function(file){
			      file_choosen(file);
			  });

}

function dnd_widget(ui, player, info){
    var drag_dest = ui.dnd_destination_create(info, null, null, null);
    this.frame = drag_dest.id;

    ui.frame_add(player.frame, drag_dest.id);

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
/*
    var file_opener = new file_opener_widget(ui, player.video, player.video, ),
    dnd = new dnd_widget(ui, player.frame, {
			     x : '0%',
			     y : '0%',
			     width : '100%',
			     height : '80%',
			     opacity : 0.1,
			     z_index : 0
			 });    */

function list_element(index){
    var frame = this.element = new ui.frame({
						  x : 0, y : (index*10) + '%',
						  width : '100%', height : '10%', z_index : 1 
					      }),
    delim = this.delim = new ui.image({
					    x : 0, y : 0,
					    width : '100%', height : 3, z_index : 1,
					    source : require('images/blue')
					});
    frame.add(delim);
}

list_element.prototype.destroy = function(){
    
};

//выделение и снятие выделения
list_element.prototype.select = function(onoff){
    if(onoff)
	this.delim.change_props({ height : 100});
    else    
	this.delim.change_props({ height : 3});
};

list_element.prototype.set = function(text){
    this.text = new ui.text({
				x : 0, y : 4,
				width : '100%', height : '96%',
				text : text
			    });
    this.element.add(text);
};

function elems_list(ui, max_elements){
    var frame = this.element = new ui.frame({
				      x : '1%', y : '5%',
				      width : '96%', height : '80%', z_index : 2
				  }),
        lelement, elems = this.elems = [];
    this.selected = undefined;

    while(max_elements){
	elems.unshift(lelement = new list_element(max_elements--));
	frame.add(lelement.element);	
    }
}

//выбор, выделение элемента при drag-motion над ним
elems_list.prototype.select = function(y){
    if(typeof this.selected != 'undefined')
	this.elems[this.selected].select(false);

    if(y){
	this.selected = Math.round(y/10 - 1);
	this.elems[this.selected].select(true);	
    } else
	this.selected = undefined;
};

elems_list.prototype.set = function(text){
  this.elems[this.selected].set(text);  
};

function playlist(player, info){
    var frame = this.element = new ui.frame(info),
    bg = new ui.image({
			    x : '0%', y : '0%',
			    width : '100%', height : '100%',z_index : 0,
			    source : require('images/file_form_bg')
			}),
    title = new ui.text({
			      x : '1%', y : '1%',
			      width : '98%', height : '10%', z_index : 1,
			      text : 'Filelist'
			}),
    add_b = new ui.button({
			     x : '1%', y : '91%',
			     width : '30%', height : '8%', z_index : 2,
			     label : 'add'
			 }),
    elems = new elems_list(ui, 10);

    frame.add(add_b);
    frame.add(bg);
    frame.add(elems.element);
    frame.add(title);
    ui.root.add(frame);

    ui.dnd_dest_activate(elems.element);
    elems.element.on('drag-motion', function(context){
			 elems.select(context.y);
			 //			    frame.change_props({height : lheight--});
			 return true;
		     });
    elems.element.on('drag-leave', function(context){
			 elems.select(undefined);
		     });
    elems.element.on('drag-drop', function(context){
			 elems.set('hahaha');
			 return true;
		     });
    elems.element.on('drag-data', function(context){
		     });
    add_b.on('pressed', function(){
		 work_zone_switcher.toggle();
		 //		      file_choosen(new tfile(addr_c.get_value()));
	     });
}

playlist.prototype.destroy = function(){
    //FIXME
};

function player(info){
    this.element = new ui.frame(info); 
    var self = this,
    video = this.video = new bplayer.video(ui,{
						   x : '1%', y : '1%',
						   width : '98%', height : '98%', 
						   z_index : 1
					       }),
    controls = new bplayer.controls(ui, video, {
					x : '2%',
					y : '88%',
					width : '96%',
					height : '10%',
					z_index : 5
				    }),
    bg = new ui.image({
			    x : '0%', y : '0%',
			    width : '100%', height : '100%',
			    z_index : 0,
			    source : require('images/main_bg')
			}),
    sanim = new animation.toggle(ui, 'slide',
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
    ui.root.add(this.element);
    bg.on('pointer_down', function(){
	      work_zone_switcher.toggle();
	  });
}

exports.main = function(){
    if(!tfile)
	tfile = require('types/file');
    var Compositer = require('modules/ui/Compositer');
    require('modules/ui/dnd');//подключаем возможности dnd в ui
    require('modules/ui/filechooser'); //подключаем возможности filechooser
    ui = new Compositer.ui();
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
    work_zone_switcher = new animation.many_toggle(ui,
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
