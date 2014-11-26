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
    g.unlink(id);
    cb();
}

/*
 * writing to object by id. Writing only as appending
 */
exports.append = function(id, data, cb){
    var stream = new gio.FileOutputStream(gio.File.parse_name(id));
//    stream.seek(0,g.SeekType.END, null);
    stream.write_async(data,1, null, cb);
    //gio.fs.appendFile(id, data, cb);
}

/*
 * reading object by id
 * 
 * cb(err, content); err may be - cannot read as need, nonexistent, underlay_err
 */

exports.read = function(id, position, length, cb){
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
