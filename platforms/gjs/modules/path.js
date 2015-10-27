var g = imports.gi.GLib;

exports.dirname = g.path_get_dirname;
exports.basename = g.path_get_basename; //nodejs basename take two arguments, this take one
exports.extname = function(){
    return '.svg';
};