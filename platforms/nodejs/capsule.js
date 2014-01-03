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
    node_c.uuid =  { node : require('../../modules/uuid') };
    node_c.timer = { js : require('../../modules/timer') };
//    node_c.transport = {zmq : require('../../modules/transport/zmq.js')};
    node_c.transport = require('../../modules/transport');
    node_c.transport.direct = require('../../modules/transport/direct');
    node_c.http_requester = require('./modules/http_requester');
    node_c.http_responder = { 'node' : require('./modules/http_responder')};
    return node_c;
}

exports.create = function(){
    return new node_capsule;
}
