const GLib = imports.gi.GLib;

exports.create = function(argv, working_directory){
    var _on_out = function(string){
	print(string);
    },
    pid = null,
    proc_in = null,
    proc_out = null;

    return {
	spawn : function(){
	  var retobj = GLib.spawn_async_with_pipes(null, argv, ['capsule=yes'], GLib.SpawnFlags.FILE_AND_ARGV_ZERO, function(){});
	    pid = retobj[1];
	    print(JSON.stringify(retobj));
	    proc_in = GLib.IOChannel.unix_new(retobj[2]);
	    proc_out = GLib.IOChannel.unix_new(retobj[3]);
	    GLib.io_add_watch(proc_out, 2, GLib.IOCondition.IN | GLib.IOCondition.HUP, function(channel, condition){
				  print('haha');
				   _on_out(proc_out.read_line_string()[1]);
			       });
	},

	in : function(string){
	    proc_in.write(string);
	},

	on_out : function(callback){
	},
	destroy : function(){
	    proc_in.unref();
	}
    };
};