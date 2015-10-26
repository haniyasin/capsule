//a wrapper module  around glib base64 functions
const GLib = imports.gi.GLib;

exports.encode = function(string){
    return GLib.base64_encode(string);
};

exports.decode =  function(encoded_string){
    return GLib.base64_decode(encoded_string);
};