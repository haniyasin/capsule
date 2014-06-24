const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

exports.create = function(argv, working_directory){
    var _on_out = function(string){
//	print(string);
    },
    pid = null,
    proc_in_unix = null,
    proc_in = null,
    proc_out = null,
    proc_out_unix = null,
    proc_out_source = null;
    return {
	spawn : function(){
	  var retobj = GLib.spawn_async_with_pipes(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, function(){});
	    pid = retobj[1];
	    proc_in_unix = new Gio.UnixOutputStream({fd : retobj[2]});
	    proc_in = new Gio.DataOutputStream({ base_stream: proc_in_unix });
	    print('nonblocking', GLib.unix_set_fd_nonblocking(retobj[3], true));
	    proc_out_unix = new Gio.UnixInputStream({fd: retobj[3]});
	    proc_out = new Gio.DataInputStream({ base_stream: proc_out_unix });
	    proc_out_source = proc_out_unix.create_source(null);
//	    proc_out_source = GLib.unix_fd_source_new(retobj[3], GLib.IOCondition.IN);
	    proc_out_source.attach(null);
	    var read_flag = true;
	    proc_out_source.set_callback(function(stream){
					     if(read_flag){
						 read_flag = false;
//						 print('blah');
						 proc_out.read_line_async(1, null, function(stream, result){
									      _on_out(proc_out.read_line_finish(result)[0]);
									      read_flag = true;
//									      print(result);
								      });
					     }
//					     if(proc_out_unix.is_readable()){
//						 _on_out(proc_out.read_line(null)[0]);
//					     }
					     return true;
				});
	},

	in : function(string){
	    print(proc_in_unix.write(string, null));
	    proc_in.flush(null);
	},

	on_out : function(callback){
	    _on_out = callback;
	},
	destroy : function(){
	    GLib.spawn_close_pid(pid);
	    proc_in.unref();
	    proc_in_unix.unref();
	    proc_out.unref();
	    proc_out_unix.unref();
	    proc_out_source.destroy();
	    proc_out.unref();
	}
    };
};