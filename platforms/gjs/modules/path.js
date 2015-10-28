var g = imports.gi.GLib;

exports.dirname = g.path_get_dirname;
exports.basename = g.path_get_basename; //nodejs basename take two arguments, this take one
exports.extname = function(path){
    var ext_patt=/\.[0-9a-z]+$/i;
    return (g.path_get_basename(path)).match(ext_patt)[0];
};