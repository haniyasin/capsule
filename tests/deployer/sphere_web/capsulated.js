exports.main = function(env){
    var dsa = require('dsa/init.js');
    dsa.init();
    
    var frontend = dsa.get('sphere/frontend'),
    backend = dsa.get('sphere/backend');
    
    backend.create().run();
    frontend.create(backend.id).run([]);
};
