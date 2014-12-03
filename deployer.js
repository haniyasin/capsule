var dutils = require('./parts/deployer_utils.js');

var deployers;

function find_deployers(fs){
    var platforms_names = fs.readdirSync('platforms');
    var deployers = {};
    for(platform in platforms_names){
	deployers[platforms_names[platform]] = require('./platforms/' + platforms_names[platform] + '/deployer.js');
    }
    return deployers;
}

function parse_args(argv){
    var config = {
	'platform' : 'nodejs',
	'action' : 'assemble',
	'dir' : null
    };


    if(argv.length < 4)
	return null;
    
    try{
	//loading filesystem module by platform
	var fs = require('platforms/' + config.platform + '/modules/fs.js');
	config.platform = argv[2];	
    } catch (x) {
	console.log("ERROR: [[", argv[2], "]] is not a platform name. ");
	return null;
    }

    deployers = find_deployers(fs);

    if(deployers.hasOwnProperty(config.platform)){
	if(argv[3] == 'list'){
	    var available_actions = [];
	    for(action in deployers[config.platform]){
		avaible_actions.push(action);
	    }		
	    console.log("Available actions is: [[ ", avaible_actions.join(','), " ]]")
	    return null;
	}else if(deployers[config.platform].hasOwnProperty(argv[3])){
	    config.action = argv[3];
	}else{
	    console.log("ERROR: action [[ ", argv[3], " ]] isn't available. Please use action [[ list ]] to list actions");
	    return null;
	}
    }

    if(argv.length == [5]){
	//проверяем существование директории
	if(fs.existsSync(argv[4]))
	    config.dir = argv[4];
	else 
	    return null;	
    }
    else{
	console.log("ERROR: configs_directory is missed");
	return null;	
    }

    return config;
}

var config = parse_args(process.argv, deployers);

if(config){
    var selected_deployer = deployers[config.platform];
    var deployer_config = new dutils.config(config.dir);
    selected_deployer[config.action](config.dir, deployer_config);
}else
    console.log("\ndeployers.js [platform] [action] [configs_directory]\n"
		+ "platform - platform from platforms directory if exist\n"
		+ "action - supported action this platform. May to know is using list action\n"
		+ "configs_directory - is directory where configs and further produced temporary files is stored\n");


