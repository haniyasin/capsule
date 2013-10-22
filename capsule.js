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
    node_c.timer = { timer : require('./modules/timer.js') };
    node_c.transport = {zmq : require('./modules/transport/zmq.js')};
    node_c.transport = {direct : require('./modules/transport/direct.js')};
    return node_c;
}

exports.create = function(){
    return new node_capsule;
}
