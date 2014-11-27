/*
 * low level storage module for gnome-gjs platform
 * API is async
 */

var g = imports.gi.GLib;
var gio = imports.gi.Gio;

/*
 * deleting object by id
 */
exports.delete = function(id, cb){
//    g.unlink(id);
    cb();
}

/*
 * writing to object by id. Writing only as appending
 */
exports.append = function(id, data, cb){
    var file = gio.file_new_for_path(id);
    function _append_cb(ostream){
	ostream.seek(0, g.SeekType.END, null);
	ostream.write(data, null);
	ostream.unref();	
	cb(0);
    }
    if(file.query_exists(null)){
	file.open_readwrite_async(1, null, 
				  function(source, res){
				      _append_cb((file.open_readwrite_finish(res)).output_stream);
				  }
				 );
    }else{
	file.create_async(gio.FileCreateFlags.NONE, 1, null, 
			  function(source, res){ _append_cb(file.create_finish(res));}
			 );
    }	
};

/*
 * reading object by id
 * 
 * cb(err, content); err may be - cannot read as need, nonexistent, underlay_err
 */

exports.read = function(id, position, length, cb){
    var file = gio.file_new_for_path(id);
    var stream = (file.open_readwrite(null)).input_stream;
    file.open_readwrite_async(1, null, function(source,res){
				  var iostream = file.open_readwrite_finish(res);
				  var istream = iostream.input_stream;
			      });
    return 0;
    var content = new Buffer(length);
    fs.open(id, 'r', function(err, fd){
		if(err)
		    cb(err, null);
		else
		    fs.read(fd, content, 0, length, position, function(err, readed_bytes, content){
				if(readed_bytes != length)
				    cb({ msg : 'readed few' });
				else
				    cb(err, content.toString());
			    });
	    });
}
