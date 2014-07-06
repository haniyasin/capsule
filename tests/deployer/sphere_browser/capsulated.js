exports.main = function(env){
    var dsa = require('dsa/init.js');
    dsa.init();
    
    var frontend = dsa.get('sphere/frontend'),
    backend = dsa.get('sphere/backend');
    
    dsa.mq.send(backend, [null,'create']).run();
    dsa.mq.send(frontend, [null,'create', backend]).run();
};
