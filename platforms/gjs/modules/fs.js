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
//    var data = g.file_get_contents(path);
//    return data[1];
};

exports.readFileSync = function(path){
    var data = g.file_get_contents(path);
//    print(data[1]);
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
    /*var file = gio.file_new_for_path(path);
    var ostream;

    if(file.query_exists(null)){
	var iostream = file.open_readwrite(null);
	var ostream = iostream.output_stream;
    }else
	ostream = file.create_async(gio.FileCreateFlags.NONE,null) ;

    ostream.seek(0, g.SeekType.SET, null);
    ostream.write(data, null);
    ostream.unref(); */
};

//отдельно стоит сказать про использование в nodejs deployer рекурсивного проверяльщика и создателя
//директорий mkpath. Поскольку в gjs также есть возможность подгружать модули и эта возможность в дальнейшем
//будет добавлена в deployer наряду с уже работающей упаковкой всех модулей в один файл, то mkpath может
//понадобиться, как он нужен в nodejs deployer 