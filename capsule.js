function capsule_module(type, name, features){
    this.type = type;
    this.name = name;
    this.features = features;
}



function capsule(){
    this.exec = function(code){
    }
}

function node_capsule(){
    var node_c = new capsule;
    node_c.uuid =  { node : require('./modules/uuid.js') };
    node_c.timer = { js : require('./modules/timer.js') };
//    node_c.transport = {zmq : require('./modules/transport/zmq.js')};
    node_c.transport = require('./modules/transport.js');
    node_c.transport.direct = require('./modules/transport/direct.js');
    node_c.http_requester = require('./node/modules/http_requester');
    node_c.http_respondent = { 'node' : require('./modules/http_respondent')};
    return node_c;
}

exports.create = function(){
    return new node_capsule;
}
