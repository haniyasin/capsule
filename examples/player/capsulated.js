/*
 * Example Player application based on capsule API(ui, io)
 */

function file_opener_widget(comp, parent, info){
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
				text : 'выберите файл или перетащите его сюда'
			    }),
    addre = comp.entry_create({
				  x : '5%',
				  y : '30%',
				  width : '80%',
				  height : '65%',
				  z_index : 2,
				  placeholder : "http://docs.gstreamer.com/media/sintel_trailer-480p.ogv"
			      }),
    addrc = comp.entry_get_control(addre),
    okb = comp.button_create({
				 x : '85%',
				 y : '30%',
				 width : '10%',
				 height : '65%',
				 z_index : 2,
				 label : 'ok'
			     }),
    okc = comp.button_get_control(okb),
    anim_show = comp.anim_create([
					   {
					       duration : 1000,
					       actions : {
						   opacity : 0   
					       }
					   }
				       ]),
    anim_hide = comp.anim_create([
					 {
					     duration : 300,
					     actions : {
						 opacity : 1
					     } 
					 }
				     ]),
    banimshow = comp.anim_bind(form_frame, anim_show),
    banimhide = comp.anim_bind(form_frame, anim_hide),    
    setup_callback;

    addrc.set_value("http://docs.gstreamer.com/media/sintel_trailer-480p.ogv");
    comp.frame_add(form_frame, bg);
    comp.frame_add(form_frame, text);
    comp.frame_add(form_frame, addre);
    comp.frame_add(form_frame, okb);
    comp.frame_add(parent.frame, form_frame);
    parent.file_opener = this;
    
    okc.on_press(function(){
		     comp.anim_start(banimhide);
		     if(typeof(setup_callback) != undefined)
			 setup_callback(addrc.get_value());
		 });

    this.setup = function(callback){
	setup_callback = callback;
	comp.anim_start(banimshow);
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
    var player = require('blocks/ui/player'),
    animation = require('blocks/ui/animation'),
    comp = Compositer.create(),
    sanim = new animation.toggle(comp, 'slide',
				  [
				      {
					  duration : 300,
					  actions : {
					      y : 100   
					  }
				      }
				  ],
				  [
				      {
					  duration : 300,
					  actions : {
					      y : -100
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
				   x : '1%', y : '1%', 
				   width : '98%', height : '97%', 
				   z_index : 1
			       }),
    file_opener = new file_opener_widget(comp, video, {
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
