/*
 * Example Player application based on capsule API(ui, io)
 */

function file_opener_widget(comp, player, parent, info){
    /*
     * common functionality
     */
    var form_frame = this.frame = comp.frame_create(info),
    bg = comp.image_create({
			       x : '0%',
			       y : '0%',
			       width : '100%',
			       height : '100%',
			       opacity : 1,
			       z_index : 1,
			       source : require('images/file_form_bg')
			   }),
    text = comp.text_create({
				x : '0%',
				y : '0%',
				width : '100%',
				height : '30%',
				z_index : 2,
				text : 'выберите или перетащите файл'
			    });

    comp.frame_add(form_frame, bg);
    comp.frame_add(form_frame, text);
    comp.frame_add(parent.frame, form_frame);
    parent.file_opener = this;
    function file_choosen(address){
	player.source = address;
	player.vcontrol.load(player.source);
	player.slide.on();
	//player.slide.off();
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
					      label : 'выбрать нужный файл'
				     });
    comp.frame_add(form_frame, filechooser.id);
    filechooser.on_choose(function(context){
			      file_choosen(context.data);
			  });
    /*
     * dnd file
     */

    /*
     * finishing choosing file
     */
    var ok_b = comp.button_create({
				  x : '40%',
				  y : '72%',
				  width : '20%',
				  height : '20%',
				  z_index : 2,
				  label : 'ok'
			     }),
    ok_c = comp.button_get_control(ok_b);


    comp.frame_add(form_frame, ok_b);
    ok_c.on_press(function(){
		      file_choosen(addr_c.get_value());
		 });

    this.setup = function(callback){
	setup_callback = callback;
    };
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
		     player.vcontrol.load(player.source = context.data);
		 });

    this.destroy = function(){
	drag_dest.destroy();
    };
}

exports.main = function(){
    var Compositer = require('modules/ui/Compositer');
    require('modules/ui/dnd');//подключаем возможности dnd в Compositer
    require('modules/ui/filechooser'); //подключаем возможности filechooser

    var player = require('blocks/ui/player'),
    animation = require('blocks/ui/animation'),
    comp = Compositer.create(),
    sanim = new animation.toggle(comp, 'slide',
				  [
				      {
					  duration : 300,
					  actions : {
					      y : -100   
					  }
				      }
				  ],
				  [
				      {
					  duration : 300,
					  actions : {
					      y : 100
					  } 
				      }
				  ]
				 ),
    bg = comp.image_create({
			       x : '0%', y : '0%',
			       width : '100%', height : '100%',
			       z_index : 0,
			       source : require('images/main_bg')
			   });
    comp.frame_add(0, bg);
    var video = new player.video(comp, {frame : 0}, {
				   x : '1%', y : '101%', 
				   width : '98%', height : '98%', 
				   z_index : 1
			       }),
    file_opener = new file_opener_widget(comp, video, video, {
					     x : '0%',
					     y : '-100%',
					     width : '100%',
					     height : '90%',
					     opacity : 1,
					     z_index : 1
					 }),
    controls = new player.controls(comp, video, video, {
				       x : '1%',
				       y : '89%',
				       width : '98%',
				       height : '10%',
				       opacity : '0%',
				       z_index : 1
			    }),
    dnd = new dnd_widget(comp, video, {
			     x : '0%',
			     y : '0%',
			     width : '100%',
			     height : '80%',
			     opacity : 0.1,
			     z_index : 2
			 });    

    sanim.bind(video);

    this.destroy = function(){
	comp.frame_remove(bg);
	comp.image_destroy(bg);
    };
};
