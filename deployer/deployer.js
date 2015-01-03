var dutils = require('deployer/utils.js');

var deployer;

function find_deployer(fs, platform){
    var platforms_names = fs.readdirSync('platforms');
    for(var _platform in platforms_names){
	if(platforms_names[_platform] == platform)
	    return require('platforms/' + platform + '/deployer/deployer.js');
    }

    return null;
}

function parse_args(argv){
    var config = {
	'platform' : 'nodejs',
	'action' : 'assemble',
	'dir' : null
    };

    if(argv.length < 4)
	return null;
    var fs;
    try{
	proc.target_platform = config.platform = argv[2];
	//loading filesystem module by platform
	fs = require('platforms/' + proc.platform + '/modules/fs');
    } catch (x) {
	console.log("ERROR: [[", argv[2], "]] is not a platform name. ", proc.platform);
	return null;
    }

    deployer = find_deployer(fs, config.platform);

    if(deployer != null){
/*	if(argv[3] == 'list'){
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
	}*/
	config.action = argv[3];
    }

    if(argv.length == [5]){
	//cheking directory existing
	if(fs.existsSync(argv[4]))
	    config.dir = argv[4];
	else 	
	    return null;	
    }else{
	console.log("ERROR: configs_directory is missed");
	return null;	
    }

    return config;
}

var config = parse_args(proc.argv);

function main(){
    if(config != null){
	var deployer_config = new dutils.config(config.dir);
	if(config.action == 'run' && config.platform != proc.platform){
	    console.log('Error: host and target platforms is not equal. Please run application on same host and target platform.');
	    return;
	}
	deployer[config.action](config.dir, deployer_config);
    }else
	console.log("\ndeployer [platform] [action] [configs_directory]\n"
		    + "platform - platform from platforms directory if exist\n"
		    + "action - supported action this platform. May to know is using list action\n"
		    + "configs_directory - is directory where configs and further produced temporary files is stored\n");    
}

main();


