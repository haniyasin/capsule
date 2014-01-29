var fs = require('fs');

function find_deployers(){
    var platforms_names = fs.readdirSync('platforms');
    var deployers = {};
    for(platform in platforms_names){
	deployers[platforms_names[platform]] = require('./platforms/' + platforms_names[platform] + '/deployer.js');
    }
    return deployers;
}

function parse_args(argv, deployers){
    var config = {
	'platform' : 'nodejs',
	'action' : 'assemble',
	'dir' : null
    };


    if(argv.length < 4)
	return null;
    
    if(deployers.hasOwnProperty(argv[2]))
	config.platform = argv[2];
    else {
	console.log("ERROR: [[", argv[2], "]] is not a platform name. ");
	return null;
    }

    if(deployers.hasOwnProperty(config.platform)){
	if(argv[3] == 'list'){
	    var avaible_actions = [];
	    for(action in deployers[config.platform]){
		avaible_actions.push(action);
	    }		
	    console.log("Avaible actions is: [[ ", avaible_actions.join(','), " ]]")
	    return null;
	}else if(deployers[config.platform].hasOwnProperty(argv[3])){
	    config.action = argv[3];
	}else{
	    console.log("ERROR: action [[ ", argv[3], " ]] isn't avaible. Please use action [[ list ]] to list avaible actions");
	    return null;
	}
    }

    if(argv.length == [5]){
	//проверяем существование директории
	config.dir = argv[5];	
    }
    else{
	console.log("ERROR: configs_directory is missed");
	return null;	
    }

    return config;
}

var deployers = find_deployers();
var config = parse_args(process.argv, deployers);
if(config){
    var selected_deployer = deployers[config.platform];
    selected_deployer[config.action](config.dir);
}else
    console.log("\ndeployers.js [platform] [action] [configs_directory]\n"
		+ "platform - platform from platforms directory if exist\n"
		+ "action - supported action this platform. May be to know is using list action\n"
		+ "configs_directory - is directory where configs and further produced temporary files is stored\n");


