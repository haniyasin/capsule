var g = imports.gi.GLib;

var mkpath = function mkpath(dirpath, mode, callback){
    
};

mkpath.sync = function(path, mode){
    g.mkdir_with_parents(path, mode == undefined ? parseInt('0777',8) : mode);
};

module.exports = mkpath;