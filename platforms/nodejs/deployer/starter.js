//implementation of global proc object
global.proc = {
    argv : process.argv,
    platform : 'nodejs'   
};

proc.argv.shift();
proc.argv.shift();
//proc.argv.unshift(proc.platform);
proc.argv.unshift('deployer.js');
proc.argv.unshift('node');
//console.log(proc.argv);
require('deployer.js');
//console.log(proc.platform);