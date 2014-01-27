var fs = require('fs');

function find_deployers(){
    var platforms_names = fs.readdirSync('platforms');
    var deployers = {};
    for(platform in platforms_names){
	deployers[platforms_names[platform]] = require('./platforms/' + platforms_names[platform] + '/deployer.js');
    }
    return deployers;
}

var params = {
    'platforms' :{ //platforms must be readed from platforms directory
	'--nodejs' : 'nodejs',
	'--node-webkit' : 'node-webkit',
	'--browser' : 'browser'
    },
    'actions' : {
	'assemble' : 'assemble',
	'deploy' : 'deploy',
	'run' : 'run'	
    }
}

function parse_args(argv){
    var config = {
	'platform' : 'nodejs',
	'action' : 'assemble',
	'dir' : null
    };

    for(arg in argv){
	if(params.platforms.hasOwnProperty(argv[arg]))
	    config.platform = params.platforms[argv[arg]];
	else if(params.actions.hasOwnProperty(argv[arg]))
	    config.action = params.actions[argv[arg]];	
	else if(arg > 1)
	config.dir = argv[arg];
    }
    
    if(!config.dir)
	config.fail = true;

    return config;
}

var config = parse_args(process.argv);
var deployers = find_deployers();
var selected_deployer;
if(deployers.hasOwnProperty(config.platform))
    selected_deployer = deployers[config.platform];
else config.fail = true;

if(config.fail)
    console.log("использовать надо как-то так deployer params [action] [directory]");

console.log(deployers)
selected_deployer[config.action](config.dir);

//console.log(config);