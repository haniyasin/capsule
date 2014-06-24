var connector = require ('../../../modules/http_requester.js');

exports.create = function(info){
    var _on_progress = function(){},
        mplayer;
    if(!info.hasOwnProperty('source'))
	info.source = "http://docs.gstreamer.com/media/sintel_trailer-480p.webm";
    
    return {
	
	control : {
	    play : function(){
		mplayer = connector.create(['mplayer', '-slave', info.source], null);
    
//		mplayer.on_out(function(content){print(content)});
		mplayer.spawn();
		let GLib = imports.gi.GLib;
		mplayer.in('pause\n');
		mplayer.in('pausing\n');
		mplayer.in('pausing\n');
		GLib.timeout_add(1, 8000,function(){
				     mplayer.in('pause\n');
				     print('haha');
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