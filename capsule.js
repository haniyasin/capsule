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
    node_c.uuid =  { node : require('./modules/uuid') };
    node_c.timer = { js : require('./modules/timer') };
//    node_c.transport = {zmq : require('./modules/transport/zmq.js')};
    node_c.transport = require('./modules/transport');
    node_c.transport.direct = require('./modules/transport/direct');
    node_c.http_requester = require('./node/modules/http_requester');
    node_c.http_respondent = { 'node' : require('./node/modules/http_respondent')};
    return node_c;
}

exports.create = function(){
    return new node_capsule;
}
