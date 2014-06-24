const GtkClutter = imports.gi.GtkClutter;
const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;
const GdkX11 = imports.gi.GdkX11;
const GLib = imports.gi.GLib;
const ClutterX11 = imports.gi.ClutterX11;

exports.create = function(info, capsule){
    var comp = capsule.modules.ui.Compositer;
    var connector = capsule.parts.connectors.pipe;
    var _on_progress = function(){},
        mplayer;
    if(!info.hasOwnProperty('source'))
	info.source = "http://docs.gstreamer.com/media/sintel_trailer-480p.webm";
    var window =  new Gtk.Window({ type : Gtk.WindowType.TOPLEVEL });
    window.set_size_request(600, 400);
    window.title = 'video test';
    window.show();
    var surface = new Gtk.Socket();
    window.add(surface);
    surface.show_all();
    surface.realize();

    var element = new comp.element_proto(new ClutterX11.TexturePixmap.new_with_window(surface.get_id()), info);

    element.actor.window_redirect_automatic = true;
    element.actor.show();

    return {
	handle : comp.elements.put(element),
	control : {
	    play : function(){
//		print(['mplayer', '-wid' + surface.get_id(), '-slave', info.source]);
//		return;
		mplayer = connector.create(['mplayer', '-wid', surface.get_id().toString(), '-slave', info.source], null);
		
		mplayer.on_out(function(content){if(content != null) print(content)});
		mplayer.spawn();

		mplayer.in('pause\n');
		mplayer.in('pausing\n');
		mplayer.in('pausing\n');
		GLib.timeout_add(1, 2000,function(){
				     //				     mplayer.in('pause\n');
				     //				     print('haha');
				 });
	    },
	    pause : function(){
	    },
	    set_position : function(msecond){
	    },
	    get_position : function(){},
	    get_duration : function(){},
	    get_volume : function(){},
	    set_volume : function(volume){},
	    on_timeupdate : function(callback){
		_on_progress = callback;
	    }
	}
    };
};