/*
 * Доступ к файловой системе, пока API полностью идентичен nodejs fs. Но в дальнейшем нужно будет
 * продумать API так, чтобы он был портируем в другие среды. На первый взгляд nodejs fs вполне портируем,
 * и он уже прошёл опробацию тысячами разработчиков, но жизнь покажет. На первых порах тут будет реализация
 * только тех функций, которые используются внутри capsule и deployer'ом. Это необходимо для начала полной
 * поддержки capsule в gjs, включая развёртывание из исходных текстов   
 */

let g = imports.gi.GLib;
let gio = imports.gi.Gio;

exports.existsSync = function(path){
    var file = gio.file_new_for_path(path);
    return file.query_exists(null);
};

exports.readdirSync = function(path){
    let dir = gio.file_new_for_path(path);
    let children = dir.enumerate_children('standard::name,standard::type',
                                          gio.FileQueryInfoFlags.NONE, null);
    var files = [];
    let info, child;
    while ((info = children.next_file(null)) != null) {
	files.unshift(info.get_name());
    }
    return files.sort();  
};

exports.mkdir = function(path){
    g.mkdir_with_parents(path, parseInt('0766', 8));    
};

exports.readFile = function(path, cb){
    var data = g.file_get_contents(path);

    cb(false, data[1]);
    print(data[1]);
    return;

    //temporary not worked
    var file = gio.file_new_for_path(path);

    function _finisher(source, res){
	var iostream, istream;
	iostream = file.open_read_write_finish(res);
	istream = iostream.input_stream;
	istream.seek(0, g.SeekType.SET, null);
	istream.read_async(data, 1, null, function(source, res){
			       istream.read_finish();
			       ostream.unref(); 
			       iostream.unref();
			       cb(data);
			   });
    }    

    file.open_readwrite_asymc(1,null, _finisher);
};

exports.readFileSync = function(path){
    var data = g.file_get_contents(path);

    return data[1];
};

exports.writeFileSync = function(path, data){
    var file = gio.file_new_for_path(path);
    var ostream;

    if(file.query_exists(null)){
	var iostream = file.open_readwrite(null);
	ostream = iostream.output_stream;
    }else
	ostream = file.create(gio.FileCreateFlags.NONE,null) ;

    ostream.seek(0, g.SeekType.SET, null);
    ostream.write(data, null);
    ostream.unref();
};

exports.writeFile = function(path, data, cb){
    var file = gio.file_new_for_path(path);

    function _finisher(source, res){
	var iostream, ostream;
	iostream = file.open_read_write_finish(res);
	ostream = iostream.output_stream;
	ostream.seek(0, g.SeekType.SET, null);
	ostream.write_async(data, 1, null, function(source, res){
				ostream.write_finish();
				ostream.unref(); 
				iostream.unref();
				cb();
			    });
    }    

    if(file.query_exists(null))
	file.open_readwrite_async(1,null, _finisher);
    else
	file.create_async(gio.FileCreateFlags.NONE, 1, null, _finisher) ;
};

//отдельно стоит сказать про использование в nodejs deployer рекурсивного проверяльщика и создателя
//директорий mkpath. Поскольку в gjs также есть возможность подгружать модули и эта возможность в дальнейшем
//будет добавлена в deployer наряду с уже работающей упаковкой всех модулей в один файл, то mkpath может
//понадобиться, как он нужен в nodejs deployer 