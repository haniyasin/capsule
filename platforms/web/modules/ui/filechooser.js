var tfile,
    comp = require('./Compositer');

function choose_catcher(event_name, callback){
    this.html.onchange = function(){ 
	var context = {};
	var file = new tfile(URL.createObjectURL(this.html.files[0]));
	file.name = this.html.files[0].name;
	callback(file); 
    };

    return false;    
}

function filechooser(info){
    this.html = document.createElement('input');
    this.html.type = 'file';
    
    if (typeof info.label === 'string') {
        this.html.label = info.label;
    }
    if(!tfile)
	tfile = require('types/file');
    this.catch_on('choose', choose_catcher);
    
    this.prepare(info);
};

filechooser.prototype = new comp.unit();


