function constructor(module_loader){
 return (function(current){function _capsulated(module, exports, require){
exports.main = function(env){
    var capsule = env.capsule;
//    capsule.tests.modules.transport.direct.test(capsule);
    capsule.tests.modules.timer.test(capsule);
    
//    console.log(JSON.stringify(capsule.modules.transport.http));
//    var thsocket = capsule.tests.modules.transport.http.socket_cli;
    
//    thsocket.test({ 'url' : 'http://localhost:8810/sockethh.js', 'method' : 'POST'}, capsule);
    
//    var thttp = capsule.tests.modules.transport.http.client;
    
//    thttp.test({ 'url' : 'http://localhost:8810/krevetk/o', 'method' : 'POST'}, capsule);

}



};module_loader.add("tests/deployer/gjs/capsulated.js",_capsulated);current.capsulated = module_loader.load('tests/deployer/gjs/capsulated.js');current.capsule = (function(current){current.dependencies = (function(current){function _bb_allocator(module, exports, require){
//универсальный выделятор переиспользуемых кирпичей
exports.id_allocator = function(){
    var counter = 0;
    this.create = function(){
        return ++counter;
    }
    this.destroy = function(){
        //надо бы подумать об удалении, но в обычной ситуации скорее будет переиспользоваться
    }
}

//black box allocalor
exports.create = function(allocator){
    var busy = [];
    var free = [];
    var allocator =  new allocator();
    this.alloc = function(){
//	console.log(free.length);
//	console.log(busy.length);
        if (free.length) {
            var obj = free.pop();
            busy.push(obj);
            return obj;
        } else {
            var obj = allocator.create(arguments);
            busy.push(obj);

            return obj;
        }   
    }
    this.free = function(obj){
        for (ind in busy){
            if(busy[ind] == obj){
//		console.log("freeing");
                busy.splice(ind,1);
                free.push(obj);
            }
        }
    }
}

//конец универсального выделятора
};module_loader.add("parts/bb_allocator.js",_bb_allocator);current.bb_allocator = module_loader.load('parts/bb_allocator.js');function _cb_synchronizer(module, exports, require){
exports.create = function(){
    var callbacks = [];
    return {
	"add" : function(callback, how_many){
	    if(how_many == undefined)
		how_many = 1;
	    callbacks.push([callback, how_many]);
	    var parent = this;
	    return function(){
		for (ind in callbacks){
		    if(callbacks[ind][0] == callback){
			var how_many = callbacks[ind][1] -= 1;
			if(how_many == 0){
			    callbacks.splice(ind,1);
			}
		    }
		}
		callback.apply(this, arguments);
//		callback.apply(this, Array.prototype.reverse.call(arguments));
		if(!callbacks.length)
		    parent.after_all();
	    }
	},

	"after_all" : function(callback){
	}
    }
}
};module_loader.add("parts/cb_synchronizer.js",_cb_synchronizer);current.cb_synchronizer = module_loader.load('parts/cb_synchronizer.js');function _base32(module, exports, require){
;(function(){

// This would be the place to edit if you want a different
// Base32 implementation

var alphabet = '0123456789abcdefghjkmnpqrtuvwxyz'
var alias = { o:0, i:1, l:1, s:5 }

/**
 * Build a lookup table and memoize it
 *
 * Return an object that maps a character to its
 * byte value.
 */

var lookup = function() {
    var table = {}
    // Invert 'alphabet'
    for (var i = 0; i < alphabet.length; i++) {
        table[alphabet[i]] = i
    }
    // Splice in 'alias'
    for (var key in alias) {
        if (!alias.hasOwnProperty(key)) continue
        table[key] = table['' + alias[key]]
    }
    lookup = function() { return table }
    return table
}

/**
 * A streaming encoder
 *
 *     var encoder = new base32.Encoder()
 *     var output1 = encoder.update(input1)
 *     var output2 = encoder.update(input2)
 *     var lastoutput = encode.update(lastinput, true)
 */

function Encoder() {
    var skip = 0 // how many bits we will skip from the first byte
    var bits = 0 // 5 high bits, carry from one byte to the next

    this.output = ''

    // Read one byte of input
    // Should not really be used except by "update"
    this.readByte = function(byte) {
        // coerce the byte to an int
        if (typeof byte == 'string') byte = byte.charCodeAt(0)

        if (skip < 0) { // we have a carry from the previous byte
            bits |= (byte >> (-skip))
        } else { // no carry
            bits = (byte << skip) & 248
        }

        if (skip > 3) {
            // not enough data to produce a character, get us another one
            skip -= 8
            return 1
        }

        if (skip < 4) {
            // produce a character
            this.output += alphabet[bits >> 3]
            skip += 5
        }

        return 0
    }

    // Flush any remaining bits left in the stream
    this.finish = function(check) {
        var output = this.output + (skip < 0 ? alphabet[bits >> 3] : '') + (check ? '$' : '')
        this.output = ''
        return output
    }
}

/**
 * Process additional input
 *
 * input: string of bytes to convert
 * flush: boolean, should we flush any trailing bits left
 *        in the stream
 * returns: a string of characters representing 'input' in base32
 */

Encoder.prototype.update = function(input, flush) {
    for (var i = 0; i < input.length; ) {
        i += this.readByte(input[i])
    }
    // consume all output
    var output = this.output
    this.output = ''
    if (flush) {
      output += this.finish()
    }
    return output
}

// Functions analogously to Encoder

function Decoder() {
    var skip = 0 // how many bits we have from the previous character
    var byte = 0 // current byte we're producing

    this.output = ''

    // Consume a character from the stream, store
    // the output in this.output. As before, better
    // to use update().
    this.readChar = function(char) {
        if (typeof char != 'string'){
            if (typeof char == 'number') {
                char = String.fromCharCode(char)
            }
        }
        char = char.toLowerCase()
        var val = lookup()[char]
        if (typeof val == 'undefined') {
            // character does not exist in our lookup table
            return // skip silently. An alternative would be:
            // throw Error('Could not find character "' + char + '" in lookup table.')
        }
        val <<= 3 // move to the high bits
        byte |= val >>> skip
        skip += 5
        if (skip >= 8) {
            // we have enough to preduce output
            this.output += String.fromCharCode(byte)
            skip -= 8
            if (skip > 0) byte = (val << (5 - skip)) & 255
            else byte = 0
        }

    }

    this.finish = function(check) {
        var output = this.output + (skip < 0 ? alphabet[bits >> 3] : '') + (check ? '$' : '')
        this.output = ''
        return output
    }
}

Decoder.prototype.update = function(input, flush) {
    for (var i = 0; i < input.length; i++) {
        this.readChar(input[i])
    }
    var output = this.output
    this.output = ''
    if (flush) {
      output += this.finish()
    }
    return output
}

/** Convenience functions
 *
 * These are the ones to use if you just have a string and
 * want to convert it without dealing with streams and whatnot.
 */

// String of data goes in, Base32-encoded string comes out.
function encode(input) {
  var encoder = new Encoder()
  var output = encoder.update(input, true)
  return output
}

// Base32-encoded string goes in, decoded data comes out.
function decode(input) {
    var decoder = new Decoder()
    var output = decoder.update(input, true)
    return output
}

/**
 * sha1 functions wrap the hash function from Node.js
 *
 * Several ways to use this:
 *
 *     var hash = base32.sha1('Hello World')
 *     base32.sha1(process.stdin, function (err, data) {
 *       if (err) return console.log("Something went wrong: " + err.message)
 *       console.log("Your SHA1: " + data)
 *     }
 *     base32.sha1.file('/my/file/path', console.log)
 */

var crypto, fs
function sha1(input, cb) {
    if (typeof crypto == 'undefined') crypto = require('crypto')
    var hash = crypto.createHash('sha1')
    hash.digest = (function(digest) {
        return function() {
            return encode(digest.call(this, 'binary'))
        }
    })(hash.digest)
    if (cb) { // streaming
        if (typeof input == 'string' || Buffer.isBuffer(input)) {
            try {
                return cb(null, sha1(input))
            } catch (err) {
                return cb(err, null)
            }
        }
        if (!typeof input.on == 'function') return cb({ message: "Not a stream!" })
        input.on('data', function(chunk) { hash.update(chunk) })
        input.on('end', function() { cb(null, hash.digest()) })
        return
    }

    // non-streaming
    if (input) {
        return hash.update(input).digest()
    }
    return hash
}
sha1.file = function(filename, cb) {
    if (filename == '-') {
        process.stdin.resume()
        return sha1(process.stdin, cb)
    }
    if (typeof fs == 'undefined') fs = require('fs')
    return fs.stat(filename, function(err, stats) {
        if (err) return cb(err, null)
        if (stats.isDirectory()) return cb({ dir: true, message: "Is a directory" })
        return sha1(require('fs').createReadStream(filename), cb)
    })
}

base32 = {
    Decoder: Decoder,
    Encoder: Encoder,
    encode: encode,
    decode: decode,
    sha1: sha1
}

if (typeof(exports) !== 'undefined'){
    //need fix for commonjs
    // ix : not quite, exist module loaders runned in browser - HAHA!
    module.exports = base32    
} else if (typeof window !== 'undefined') {
    // we're in a browser - OMG!
    window.base32 = base32
} 
})();

};module_loader.add("dependencies/base32.js",_base32);current.base32 = module_loader.load('dependencies/base32.js');function _serializer(module, exports, require){
/*
 * Copyright 2013-2014, Qubit Group
 * http://opentag.qubitproducts.com
 * @author Peter Fronc peter.fronc@qubitproducts.com
 * 
 * This library is licensed under LGPL v3 license.
 * For details please see attached LICENSE file or go to:
 * https://www.gnu.org/licenses/lgpl.html
 */

(function () {
  
  var json = {};

  function checkIfInstanceOf(object, instances) {
    for (var i = 0; i < instances.length; i++) {
      if ((typeof(instances[i]) === "function") && /*ie case*/
            object instanceof instances[i]) {
        return true;
      }
    }
    return false;
  }
  
  json.checkIfInstanceOf = checkIfInstanceOf;
  
  function checkIfTypeOf(object, types) {
    for (var i = 0; i < types.length; i++) {
      if (typeof(object) === types[i]) {
        return true;
      }
    }
    return false;
  }

  function checkIfNameOf(string, names) {
    for (var i = 0; i < names.length; i++) {
      if (string === names[i]) {
        return true;
      }
    }
    return false;
  }

  function objectExistsInParentElements(object, parentElements) {
    if (object instanceof Object) {
      for (var i = 0; i < parentElements.length; i++) {
        if (parentElements[i] === object) {
          return true;
        }
      }
    }
    return false;
  }
  
  function removeFromArray(object, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === object) {
        array.splice(i, 1);
      }
    }
    return array;
  }

  function jsonString(object) {
    return "\"" + object.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"") + "\"";
  }
  var TAB = "  ";
  var _serialize = function (object, config, parentElements, level, levelMax) {
    if (!isNaN(levelMax) && level >= levelMax) {
      return undefined;
    }
    var excludedInstances, excludedTypes, excludedNames, own,
            includeFunctions = false, excludeOnTrue, dateAsString = true,
            raw = false, fakeFunctions = false, realFunctions = false,
            prettyPrint = false;
    
    if (config) {
      if (config.prettyPrint) {prettyPrint = true;}
      if (config.raw) raw = config.raw; //json type as default
      if (config.excludedInstances) excludedInstances = config.excludedInstances;
      if (config.excludedTypes) excludedTypes = config.excludedTypes;
      if (config.excludedNames) excludedNames = config.excludedNames;
      if (config.own) own = config.hasOwn;
      if (config.fakeFunctions) fakeFunctions = config.fakeFunctions;
      if (config.realFunctions) realFunctions = config.realFunctions;
      if (config.includeFunctions) includeFunctions = config.includeFunctions;
      if (config.excludeOnTrue) excludeOnTrue = config.excludeOnTrue;
      if (config.dateAsString) dateAsString = config.dateAsString;
    }
    
    var indent = "";
    var eol = "";
    if (prettyPrint) {
      for (var i = 0; i < level; i++) {
        indent += TAB;
      }
      eol = "\n";
    }
    
    if (object instanceof Date) {
      return (!raw || dateAsString) ?
        jsonString(object.toISOString()) : object.valueOf();
    } else if (!includeFunctions && typeof object === "function") {
      return undefined;
    } else if (typeof object === "number") {
      return drawValue(indent, String(object));
    } else if (typeof object === "string") {
      return drawValue(indent, jsonString(object));
    } else if (object === null) {
      return drawValue(indent, "null");
    } else if (object === undefined) {
      return raw ? drawValue(indent, "undefined") : undefined;
    } else if (typeof prop === "boolean") {
      return drawValue(indent, String(object));
    }
    
        
    if (includeFunctions && typeof object === "function") {
      if (fakeFunctions) {
        return "(function(){})";
      }
    }
    
    if (includeFunctions && typeof object === "function") {
      if (realFunctions) {
        var out = prettyPrint ? object.toString() : object.toString();
        return drawValue(indent, out);
      }
    }
    
    if (objectExistsInParentElements(object, parentElements)) {
      return undefined;//"\"[parent contained]\"";
    }
    
    parentElements.push(object);
    ++level;
    
    if (object instanceof Array) {
      var strings = [];
      for (var i = 0; i < object.length; i++) {
        if (excludeOnTrue) {
          try {
            if (excludeOnTrue(object)) {
              continue;
            }
          } catch (ex) {}
        }
        if (excludedInstances && checkIfInstanceOf(object, excludedInstances)) {
          continue;
        }
        if (excludedTypes && checkIfTypeOf(object, excludedTypes)) {
          continue;
        }
        try {
          var el = _serialize(object[i], config, parentElements, level, levelMax);
        } catch (ex) {
          removeFromArray(object, parentElements);
          return jsonString(String(ex));
        }
        if (el !== undefined) {
          strings.push(el);
        }
      }
      removeFromArray(object, parentElements);
      return drawObject("[", "]", indent, eol, strings);
    }

    var parts = [];
    for (var key in object) {
      var prop = object[key];
      if (own && !object.hasOwnProperty(key)) {
        continue;
      }
      if (excludeOnTrue) {
        try {
          if (excludeOnTrue(object)) {
            continue;
          }
        } catch (ex) {}
      }
      if (excludedInstances && checkIfInstanceOf(prop, excludedInstances)) {
        continue;
      }
      if (excludedTypes && checkIfTypeOf(prop, excludedTypes)) {
        continue;
      }
      if (excludedNames && checkIfNameOf(key, excludedNames)) {
        continue;
      }
      try {
        var objEl = _serialize(prop, config, parentElements, level, levelMax);
        if (objEl !== undefined) {
          var elString = ("\"" + key.replace(/\"/g, "\\\"") + "\":") + objEl;
          parts.push(elString);
        }
      } catch (ex) {//SOME OBJECT CAN THROW EXCEPTION ON Access, FRAMES ETC.
        removeFromArray(object, parentElements);
        return jsonString(String(ex));
      }
    }
    removeFromArray(object, parentElements);
    return drawObject("{", "}", indent, eol, parts);
  };

  function drawValue(indent, string) {
    return indent ? (" " + string) : string;
  }

  function drawObject(s, e, indent, eol, parts){
    var array, spaceAfterColon = " ";
    if (indent==="") {
      spaceAfterColon = "";
    }
    if (indent || eol) {
      if (parts.length === 0 ) {
        array = [spaceAfterColon, s, parts.join(","), e];
      } else {
        array = [spaceAfterColon, s, "\n",
                indent, TAB,
                      parts.join("," + "\n" + indent + TAB),
                "\n",indent, e
              ];
      }
    } else {
      array = [s, parts.join(","), e];
    }
    
    return array.join("");
  }

  /**
   * Exclusive and luxury javascript serializer.
   * 
   * Config object assignment:
   * 
   * <pre>
   *   config.excludedInstances Instanceof will be called
   *      on  excludeInstancess functions array
   *   config.excludedTypes array of objects that typeof
   *    will be called in order to exclude properties on object
   *   config.excludedNames array of strings that will be check
   *    on object's properties
   *   config.hasOwn if hasOwnProperty should apply for objects 
   *        (default false)
   *   config.realFunctions serializer will output toString of function objects,
   *    this option only applies if includeFunctions is enabled
   *   config.fakeFunctions if includeFunctions is applied, this option will cause
   *    empty function to be attached for such objects.
   *   config.includeFunctions if 
   *      functions should be included (default false), if only this option is specified
   *      fuinctions will be treated as objects and serializer will go over its properties.
   *   config.excludeOnTrue function that will take
   *      current objects property and must return boolean, if returns true,
   *      object will be added to serialized string
   *   config.level if specified, ho maximally deep
   *    properties generation can go.
   *   config.dateAsString = treat dates as strings (default true)
   *   config.raw dont use "json" specific output and serialize real values
   *     (undefines, dates as numbers)
   * </pre>
   * 
   * @param {type} object
   * @param {Object} config
   * @returns {String}
   */
  json.serialize = function (object, config) {
    var parentElements = [];
    var level;
    if (config) {
      level = config.level;
    }
    return _serialize(object, config, parentElements, 0, level);
  };

  /**
   * Parsing json function with specification specified in RFC4627, section 6. 
   * It is a simple security check. Enough for most of needs.
   * @param {type} string
   * @returns {RegExp}
   */
  json.parse = function (string) {
    if (!(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
         string.replace(/"(\\.|[^"\\])*"/g, '')))) {
      var expression = "json.___tmp = (" + string + ")";
      if (window && window.execScript) {
         window.execScript(expression);
       } else {
         (function () {
           try {
             return window["eval"].call(window, expression);
           } catch (noWindow) {
             return (73, eval)(expression);
           }
         }());
       }
     } else {
       throw "insecure json!";
     }
     return json.___tmp;
  };
  
  /**
   * Simple function securing string to be used in json.
   * @type _L12.jsonString
   */
  json.jsonString = jsonString;
  
  try {
    window.json = json;
  } catch (noWindow) {
    (73, eval)("this").json = json;
  }
  
  try {
    module.exports = json;
  } catch (e) {
    //try exports
  }
}());

};module_loader.add("dependencies/json.js",_serializer);current.serializer = module_loader.load('dependencies/json.js');function _utils(module, exports, require){
exports.msg_queue = function(){
    var cb;
    var queue = [];
    this.add = function(msg){
	queue.push(msg);
	cb(msg);
    }
    this.pop = function(){
	return queue.pop();
    }
    this.on_add = function(callback){
	cb = callback;
    }
}
};module_loader.add("parts/utils.js",_utils);current.utils = module_loader.load('parts/utils.js');function _error(module, exports, require){
/*
 * common error object, used as standart envelope for any errors or exceptions in functions, callbacks or 
 * services
 */

module.exports = function(name, msg){
    this.name = name;
    this.msg = msg;
}
};module_loader.add("parts/error.js",_error);current.error = module_loader.load('parts/error.js');return current;})({});
current.modules = (function(current){function _sequence(module, exports, require){
var serializer = require('../dependencies/json.js'),
    error = require('../parts/error.js'),
    sconfig = {
	realFunctions : true,
	includeFunctions : true
    };

function do_args(args, stack){
    for(ind in args){
	if(typeof(args[ind]) == 'string'){
	    var result;
	    if(result = /stack[.]*\[*(\w+)\]*\[*(\d*)\]*/.exec(args[ind])){
		if(result.length == 2)
		    args[ind] = stack[result[1]];
		else if(result.length == 3)
		args[ind] = stack[result[1]][result[2]];
	    }
	}
    }
}

//calling local function with callback
function function_with_cb_do(action, name, stack, next){
    var func = action.shift();
    do_args(action, stack);

    action[action.length] = function(){
	if(name)
	    stack[name] = arguments;
	sprout(next, stack);	
    };

    func.apply(null, action);
}

//passing message to service
function service_do(action, name, stack, next){
    var service = action.shift();

//    do_args(action, stack);

    action.unshift({"stack" : stack,
		    "name" : name,
		 "next" : next});
    exports.mq_send(service, action);
    //further working with sprout doin inside service_loader
}

//calling function
function function_do(action, stack, next){
 //   console.log("far function elem is: " + elem);
    var func = action.shift();
    
    if(!func(exports, stack))
       sprout(next, stack);
}

function element_do(element, stack){
    if(typeof(element) != 'object' || element == null)
	return new error('element is incorrect', JSON.stringify(element));

    if(!element.hasOwnProperty('action'))
	return new error('element has no action property', JSON.stringify(element));

    var action =  element.action;
    var next = element.hasOwnProperty('next') ? element.next : [];
    var name = element.hasOwnProperty('name') ? element.name : 0;

    if(!action.length)
	return new error("element\'s action field is empty", JSON.stringify(element.action));	

    var type = action.shift();

    switch(type){
	// function with callback on last argument
    case 'c' : 
	function_with_cb_do(action, name, stack, next);
	break;
	
	//adapter
    case 'a':
	break;

	//message to service
    case 's' :
	service_do(action, name, stack, next);
	break;

	//function far. function which is executed in same place as element before
    case 'f' : 
	function_do(action, stack, next);
    break;
   }    
}

function sprout(sprout, stack){
    sprout = serializer.serialize(sprout , sconfig);
    sprout = eval(sprout);

    if(typeof(stack) === 'undefined')
	stack = [];

    for(element in sprout){
	var ret = element_do(sprout[element], stack);
	if(ret instanceof error){
	    error.msg = '[in ' + element + 'scope]' + error.msg;
	}	
    }

    return true;    
};

exports.mq_send = function(){};

//low level api

exports.run = sprout;


//high level api

function element(type){
    return function(){
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift(type);
	return {
	    action : args,

	    sprout : function(){
		if(!this.hasOwnProperty('next'))
		    this.next = [];
		for(arg in arguments){
		    if(arguments[arg] instanceof Array)
			this.next = this.next.concat(arguments[arg]); //merging with low level sprout
		    else
			this.next.push(arguments[arg]);
		}
		return this;    
	    },
	    run : function(stack){
		return sprout([this], stack);
	    }
	};
    };
}

exports.msg = element('s');

exports.f = element('f');

exports.c = element('c');

};module_loader.add("modules/sequence.js",_sequence);current.sequence = module_loader.load('modules/sequence.js');function _uuid(module, exports, require){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

(function() {
  var _global = this;

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng;

  // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
  //
  // Moderately fast, high quality
  if (typeof(_global.require) == 'function') {
    try {
      var _rb = _global.require('crypto').randomBytes;
      _rng = _rb && function() {return _rb(16);};
    } catch(e) {}
  }

  if (!_rng && _global.crypto && crypto.getRandomValues) {
    // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
    //
    // Moderately fast, high quality
    var _rnds8 = new Uint8Array(16);
    _rng = function whatwgRNG() {
      crypto.getRandomValues(_rnds8);
      return _rnds8;
    };
  }

  if (!_rng) {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var  _rnds = new Array(16);
    _rng = function() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return _rnds;
    };
  }

  // Buffer class to use
  var BufferClass = typeof(_global.Buffer) == 'function' ? _global.Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = options.clockseq != null ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = options.msecs != null ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});
  } else if (typeof(module) != 'undefined' && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else {
    // Publish as global (in browsers)
    var _previousRoot = _global.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _global.uuid = _previousRoot;
      return uuid;
    };

    _global.uuid = uuid;
  }
}).call(this);

};module_loader.add("dependencies/uuid.js",_uuid);current.uuid = module_loader.load('dependencies/uuid.js');current.uuid = (function(current){function _upper(module, exports, require){
var _uuid;
if(typeof(window) == 'object')
    _uuid = uuid;
else
    _uuid = require('../dependencies/uuid.js');

exports.generate_str = function(){
    return _uuid.v1();
}

exports.generate_bin = function(){
    var uuid_b = new Array(16);
    _uuid.v1(null, uuid_b, 0);
    return uuid_b;
}

exports.parse = function(UUID_string){
    return _uuid.parse(UUID_string);
}

exports.unparse = function(buffer){
    return _uuid.unparse(buffer);
}

exports.validate = function(UUID){
    
}
};module_loader.add("modules/uuid.js",_upper);current = module_loader.load('modules/uuid.js');return current;})({});
current.timer = (function(current){function _js(module, exports, require){
var error = require('../parts/error.js');

exports.create = function(callback, milisec, cyclic){
    if(typeof(setInterval) == 'undefined'
       &&typeof(setTimeout) == 'undefined')
	return new error('not supported', 'this platform is not supported timer functionality');
 
    return {
	id : cyclic ? setInterval(callback, milisec) : setTimeout(callback, milisec),
	destroy : function(){
	    cyclic ? clearInterval(this.id) : clearTimeout(this.id);
	}
    };
}
};module_loader.add("modules/timer.js",_js);current.js = module_loader.load('modules/timer.js');return current;})({});
current.transport = (function(current){function _upper(module, exports, require){
exports.features = {
    //коннектищейся, поддерживает множество входных и выходных сообщений асинхронно
    'client' : 0x00000001,
    //принимающий, поддерживает множество входных и выходных сообщений асинхронно
    'server' : 0x00000002,
    //нуждается в адресе при создании или нет. Если 1, то нужно, если 0, то не нуждается. Некоторые типы транспортов не могут иметь адреса впринципе, например принимающий сообщения вебворкер.
    'need_address' : 0x00000000,
    //только один экземпляр транспорта возможен, если 1. Опять же имеет смысл для webworker, ajax или когда создатель капсулы устанавливает подобные ограничения даже для tcp, udp и других транспортов
    'only_one_instance' : 0x00000000
}

exports.instance_interface = function(){
    this.send = function(msg_id, msg, callback){
    }

    this.on_msg = function(msg_id, callback){
	
    }
    
    this.error_callback = function(error){
    }

}

};module_loader.add("modules/transport.js",_upper);current = module_loader.load('modules/transport.js');function _direct(module, exports, require){
var transport = require('../transport.js');
var callbacks = new Array();

exports.create = function(context, features, capsule){
    if(!callbacks.hasOwnProperty(context.url))
	callbacks[context.url] = new Array();
    if(features & transport.features.server){
        return {
	    "on_connect" : function(callback){
		if(callback != null)
		    callbacks[context.url][0] = function(uuid){
			callback({
				     "on_msg" : function (callback){
					 callbacks[context.url]['s' + uuid] = callback;
				     },
				     "send" : function(msg){
					 if(typeof(callbacks[context.url]["c" + uuid]) == 'function')
					     callbacks[context.url]["c" + uuid](msg);
					 else console.log("server: Callback on msg from", uuid, "client is not setted");
				     },
				     "on_destroy" : function(callback){
					 callbacks[context.url]['ds'][uuid] = callback;
				     },
				     "destroy" : function(){
					 callbacks[context.url]['s' + uuid] = null;

					 if(callbacks[context.url]['ds'][uuid])
					     callbacks[context.url]['ds'][uuid]();
				     }
				 });
		    }
	    },
	    "destroy" : function(){
		var destroy_cbs = callbacks[context.url]['d'];
		for(ind in destroy_cbs){
		    if(destroy_cbs[ind])
			destroy_cbs[ind]();		    
		}
		callbacks[context.url] = [];
	    }
	}		    
    }else if (features & transport.features.client){
	var uuid = capsule.modules.uuid.generate_str();
	return {
	    "connect" : function(){
		if(typeof(callbacks[context.url][0]) == 'function')
		    callbacks[context.url][0](uuid);
		else console.log("client: Callback on connect is not setted");
	    },
	    "on_msg" : function (callback){
		callbacks[context.url]["c" + uuid] = callback;
	    },
	    "send" : function(msg){
		if(typeof(callbacks[context.url]['s' + uuid]) == 'function')
		    callbacks[context.url]['s' + uuid](msg);
		else console.log("client: Callback on msg is not setted");
	    },
	    
	    "on_destroy" : function(callback){
		callbacks[context.url]['dc' + uuid] = callback;
	    },
	    "destroy" : function(){
		callbacks[context.url]['c' + uuid] = null;
		
		if(callbacks[context.url]['dc' + uuid])
		    callbacks[context.url]['dc' + uuid]();
	    }
	}
    }
}
};module_loader.add("modules/transport/direct.js",_direct);current.direct = module_loader.load('modules/transport/direct.js');current.http = (function(current){function _upper(module, exports, require){
var transport = require('../transport.js'),
    error = require('../../parts/error.js');

function frames_sender(socket, modules){
    var frames = [];
    var activated = false;
    var resend_timer;
    var _on_msg;

    function _send(frame){
	var cur_time = new Date().valueOf();
	//resending frame every 5 second
	if(!frame.ti || cur_time - frame.ti > 5000 ){
	    frame.ti = cur_time;
	    socket.send(frame);	       
	    frame.t++;
	}    
    }

    function _resend(){
	for(key in frames){
	    var frame = frames[key];
	    //checking number of trying to send
	    if(frame.t > 5){
		if(!frame.p.length){
		    frames.splice(key,1);		
		}else {
		    console.log(new error('cannot send frame', 'trouble with sockets'));
		    //		    console.log(frames[key]);		    
		}
		continue;		
	    }else
		_send(frame);
	}
    }

    this.frame_max_size = 300;

    this.add = function(frame){
	frames.push(frame);
	this.activate();
	_send(frame);
    };

    this.remove_delivered = function(ids){
	//deleting delivered frames from outgoing queue
	for(ind in ids){
	    var fk = frames.length - 1;
	    //loop in reverse because of conflicting splice and forward loop
	    while(fk >= 0){
		if(frames[fk].i == ids[ind]){
		    frames.splice(fk, 1);		    
		}
		fk--;
	    }
	}
    };

    this.activate = function(){
	if(!activated){	    
	    activated = true;
	    resend_timer = modules.timer.js.create(_resend, 500, true);	    
	}
    };

    this.deactivate = function(){
	if(activated)
	    resend_timer.destroy();
    };
}

function frames_receiver(frames_sender, msg_packer, socket, modules){
    var _on_packets = function(packets){console.log(packets)};
    var past_frames = {};
    socket.on_recv(function(msg){
		       //console.log('hahaha' + msg);
		       if(msg.r)
			   frames_sender.remove_delivered(msg.r);
		       
		       //not parsing frames which is received twice
		       if(!past_frames.hasOwnProperty(msg.i) && 
			  msg.p.length > 0){   
			   past_frames[msg.i] = true;
			   //console.log('ggg')
			   //adding received frames' ids in frame from outgoing queue
			   msg_packer.confirm_receiving(msg.i);

			   //if we are having packets - proccess packets
			   _on_packets(msg.p);
		       }
		   });

    this.on_packets = function(callback){
	if(typeof(callback) == 'function')
	    _on_packets = callback;
	else
	    return new error("frame_receiver.on_frame: callback isn't a function", callback);
	return true;
    };
}
    

function msg_packer(frames_sender, capsule){
    var bb_allocator = capsule.parts.bb_allocator;
    var modules = capsule.modules;
    var frame_id_allocator = new bb_allocator.create(bb_allocator.id_allocator);
    function get_blank_frame(){
	return { 'i' : frame_id_allocator.alloc(), 's' : 10, 'p' : [], 't' : 0, 'r' : [], 'ti' : 0};
    }

    var msg_id_allocator = new bb_allocator.create(bb_allocator.id_allocator);
    var short_frame_timer = null;

    var cur_frame = get_blank_frame();

    this.confirm_receiving = function(id){
	cur_frame.r.push(id);
    };

    this.add = function(msg){
	//creating timer for periodically sending incompleted frame
	if(!short_frame_timer)
	    modules.timer.js.create(function(){
					if(cur_frame.p.length || cur_frame.r.length){
					    frames_sender.add(cur_frame);
					    cur_frame = get_blank_frame();				
					}
				    }, 200, true);
	var packets = []; //[msg_id, packet_number,
	
	var msg_id = msg_id_allocator.alloc();
	//нужно учесть размеры технических данных
	for(var packet_ind = 0; msg.length > frames_sender.frame_max_size; packet_ind++){
	    packets.push({
			     'i' : msg_id,
			     'n' : packet_ind,
			     'd' : msg.substring(0, frames_sender.frame_max_size)
			 });
	    msg = msg.substring(frames_sender.frame_max_size);
	}
	packets.push({
			 'c' : packet_ind + 1, //amount of packets
			 'i' : msg_id,
			 'n' : packet_ind,
			 's' : msg.length + 10,
			 'd' : msg
		     });

	for(packet in packets){
	    if(cur_frame.s > frames_sender.frame_max_size){
		frames_sender.add(cur_frame);
		cur_frame = get_blank_frame();
	    }	    
	    cur_frame.p.push(packets[packet]);
	    cur_frame.s += packets[packet].s;
	}

	//последний фрейм, пусть и наполовину пустой, когда-нибудь то надо отправлять всё равно:)
    };

    this.deactivate = function(){
	if(short_frame_timer)
	    short_frame_timer.destroy();
    };
}

function msg_unpacker(_frames_receiver){
    var received_msgs = [];
    var frames = [];
    var _on_msg = function(msg){console.log(msg)};

    _frames_receiver.on_packets(
	function(packets){
	    var cur_msg;
	    for(packet in packets){
		if(!received_msgs.hasOwnProperty(packets[packet].i)){
		    received_msgs.push(cur_msg = {
					   'i' : packets[packet].i,
					   'p' : [],
					   'c' : -1
				       });
		} 
		else
		    cur_msg = received_msgs[packets[packet].i];
		
		cur_msg.p[packets[packet].n] = packets[packet].d;
		if(packets[packet].hasOwnProperty('c'))
		    cur_msg.c = packets[packet].c;
		//нужно ещё подумать как лучше обеспечить проверку и целостность
		if(cur_msg.c == cur_msg.p.length){
		    _on_msg(cur_msg.p.join(''));
		}
	    }
	});
    
    this.on_msg = function(callback){
	if(typeof(callback) == 'function')
	    _on_msg = callback;
	else
	    return new error("msg_unpacker.on_msg: callback isn't a function", callback);
	return true;
    };

}

function get_by_cli_id(array, cli_id, remove){
    for(key in array){
	if(array[key][0] == cli_id){
	    var value = array[key][1];
	    if(remove === true)
		delete array[key];
	    return value;    
	}
    }
    return null;	    
}

exports.create = function(context, features, capsule){
    var modules = capsule.modules;
    if(features & transport.features.client){
	    //здесь необходимо как-то сделать выбор то ли script, то ли xhr бекэнда, а пока xhr и post по дефолту
	var socket_cli = modules.transport.http.socket_cli;
	var socket = socket_cli.create(context, 'xhr', capsule);

	var _frames_sender = new frames_sender(socket, modules);
	var _msg_packer = new msg_packer(_frames_sender, capsule);
	var _frames_receiver = new frames_receiver(_frames_sender, _msg_packer, socket, modules);
	var _msg_unpacker = new msg_unpacker(_frames_receiver);
	var _on_destroy_cb = function(error){
	    console.log(error);
	};

	return {
	    "connect" : function(callback){
		var self = this;
		socket.on_disconnect(function(error){
					 self.destroy(error);
				     });
		socket.connect(callback);
	    },
	    "on_msg" : function(callback){
		_msg_unpacker.on_msg = callback;
	    },
	    "send" : function(msg){
		if(msg.length > 0)
		    _msg_packer.add(msg);
		else
		    return new error('transport.send: you must send something', msg);

		return true;
	    },
	    "destroy" : function(error){
		_on_destroy_cb(error);
		_frames_sender.deactivate();
		msg_packer.deactivate();
		socket.close();
	    },
	    "on_destroy" : function(callback){
		_on_destroy_cb = callback;
	    }
	};
	
    }
    else if(features & transport.features.server){
	var clients = [];
	var _on_connect;
	var socket_srv = modules.transport.http.socket_srv;
	var socket = socket_srv.create(context, modules);
	
	socket.on_connect(function(csocket){
			      var _frames_sender = new frames_sender(csocket, modules);
			      var _msg_packer = new msg_packer(_frames_sender, modules);
			      var _frames_receiver = new frames_receiver(_frames_sender, _msg_packer, csocket, modules);
			      var _msg_unpacker = new msg_unpacker(_frames_receiver);
			      clients.push({"frame_sender" :_frames_sender, "msg_packer" :_msg_packer});
			      
			      _on_connect({
					      "on_msg" : function(callback){
						  _msg_unpacker.on_msg(callback);
					      },
					      "send" : function(msg){
						  if(msg.length > 0){
						      _msg_packer.add(msg);
						  } else
						      return new error('transport.send: you must send something', msg);

						  return true;
					      },
					      "on_destroy" : function(callback){
					      }
					  });
			  });

	return {
	    "on_connect" : function(callback){
		if(typeof(callback) != 'function')
		    return new error('callback is not a function', 'set a callback please');
		_on_connect = callback;
 		return socket.listen();
	    },
	    "destroy" : function(){
		for(key in clients){
		    clients[key].frame_sender.deactivate();
		    clients[key].msg_packer.deactivate();
		}		
		socket.close();
		clients = null;
	    }
	};
    }
}


};module_loader.add("modules/transport/http.js",_upper);current = module_loader.load('modules/transport/http.js');function _socket_cli(module, exports, require){
/*
 * client implementation api like socket over http_requester
 */

var error = require('../../../parts/error.js');

function requests_holder(type, capsule){
    var modules = capsule.modules;
    var requests = []; 
    var self = this;

    this.requests_allocated = 0;
    this.success_metr = 0; //counter of success or failed
    this.on_disconnect = function(){};
    this.create_request = function(){
	//this is hack for limit of several concurent XMLHttpRequest
	if((type == 'xhr')&&(this.requests_allocated > 3))
	    return null;	    
	  
	var request = modules.http_requester.create(type);

	request.on_close(function(){
			     self.requests_allocated--;
			     if(request.hasOwnProperty('on_destroy'))
				 request.on_destroy();
			  });

	request.on_error(function(e){
			     if(--self.success_metr == 1){
				 self._lpoller.deactivate();
				 self.on_disconnect(e);
			     }
			 });

	this.requests_allocated++;
	this.success_metr++;

	return request;
    };

    this.destroy = function(request){
	request.close();
	this.requests_allocated--;
    };

    this.close_all_requests = function(){
	for(ind in _requests){
	    _requests[ind].close();
	}
    };
}

function incoming_processor(context){
    var _on_recv = function(){};

    this.on_recv = function(callback){
	_on_recv = callback;
    };

    this.get_process_msg = function(request, _holder){
	return function(data){	    
	    //ignoring reply without data and undefined reply
	    if(data != undefined && data != 'undefined' && data.length > 0){
		var pdata = JSON.parse(data);
		if(pdata.hasOwnProperty('cli_id'))//this is answer on connect msg with allocated cli_id by server
		    context.cli_id = pdata.cli_id;
//		console.log(pdata);
		if(pdata.hasOwnProperty('msg'))
		    _on_recv(pdata.msg);
		else
		    _on_recv(null); //on_connect
	    }
	    _holder.destroy(request); //в будущем надо учесть переиспользование объекта, возможно:)
	};
    };
}

function packet_sender(context, _holder, _incoming, _lpoller, modules){
    this.send = function(msg){	
	var request = _holder.create_request();
	var msg_json = JSON.stringify({'cli_id' : context.cli_id, 'msg' : msg});
	if(request){
	    request.on_recv(_incoming.get_process_msg(request, _holder));

	    request.open(context);
	    request.send(msg_json);	    	    
	}
	else{
	    _lpoller.delayed_packets.push(msg_json);	    	    
	}
    }
}

function lpoller(context, _holder, _incoming, modules){
    var poll_timer = 0;
    this.delayed_packets = [];
    var _packets = this.delayed_packets;
    var self = this;
    var request = 0;

    this.try_poll = function(){	
	if(!poll_timer){
	    poll_timer = modules.timer.js.create(
		function(){
		    if(request)
		    {
		//	console.log('req stil alive');
			return; //the new request is not needed, because current still alive		
		    }
		//    console.log('req is dead');
		    request = _holder.create_request();
		    if(request){
			request.on_destroy = function(){
			    //console.log('eeee');
			    request = 0;
			};

			request.on_recv(_incoming.get_process_msg(request, _holder));

			request.open(context);
			//в будущем неплохо бы реализовать упаковку данных в url, что даст возможность
			//не отправлять send и дольше удерживать request,  также предусмотреть multipart
			if(_packets.length)
			    request.send(_packets.shift());
			else
			    request.send(JSON.stringify({'cli_id' : context.cli_id}));
		    }else{
			self.deactivate();
			_holder.on_disconnect(new error('disconnected', 'lpoller.try_poll: cannot create request'));
			//console.log("packets is: " + _packets);
		    }
		}, 200, true);	
	}
    };

    this.deactivate = function(){
	if(typeof(_timer) == 'object'){
	    poll_timer.destroy();
            poll_timer = null;	    
	}
    };
}

exports.create = function(context, type, modules){
    var _incoming = new incoming_processor(context);
    //реализовать выбор транспорта, xhr или script для browser
    var _holder = new requests_holder(type, modules);
    var _lpoller = new lpoller(context, _holder, _incoming, modules);
    _holder.lpoller = _lpoller;
    var _sender = new packet_sender(context, _holder, _incoming, _lpoller, modules);

    context.cli_id = 0; //need connect for id allocating
    var _on_recv = function(){};

    return {
	'connect' : function(callback){
	    _incoming.on_recv(function(msg){
				  _incoming.on_recv(_on_recv);
				  _lpoller.try_poll();
				  callback();
			      });
	    _sender.send({}); //sending blank msg with cli_id==0 as connect msg
	},
	'send' : function(msg){
	    _sender.send(msg);
	},
	'on_recv' : function(callback){
	    _incoming.on_recv(_on_recv = callback);
	},
	'on_disconnect' : function(callback){
	     _holder.on_disconnect = callback;
	},
	'disconnect' : function(){
	    _holder.on_disconnect(true);
	    _holder.close_all_requests();
	    _lpoller.deactivate();
	}
    };
}

};module_loader.add("modules/transport/http/socket_cli.js",_socket_cli);current.socket_cli = module_loader.load('modules/transport/http/socket_cli.js');function _socket_srv(module, exports, require){
/*
 * server implementation api like sockets over http_responder
 */

var error = require('../../../parts/error.js');

function get_by_cli_id(array, cli_id, push){
    for(key in array){
	if(array[key][0] == cli_id){
	    var value = array[key][1];
	    delete array[key];
	    return value;    
	}
    }
    return null;	    
}
function response_holder(_incoming, capsule){
    var ids = new capsule.parts.bb_allocator.create(bb_allocator.id_allocator);
    var responses = [];
    this.delayed_packets = [];
    var extra_cleaner_timer = null; //extra connection cleaner

    var _packets = this.delayed_packets;

    var _on_error_cb = function(error){
	console.log(JSON.stringify(error));
    };

    this.on_error = function(callback){
	_on_error_cb = callback;	
    };

    this.get_waited_response = function(cli_id){
	if(responses.length)
	    return responses[cli_id].pop();
	return null;
    };

    this.activate = function(context){
	extra_cleaner_timer = capsule.modules.timer.js.create(
	    function(){
		//если много ждёт, то завершаем и оставляем не более 3
		for(cli_id in responses){				 
		    while(responses[cli_id].length > 2){
			responses[cli_id].pop().end();
		    }
		}
	    }, 2000, true);

	ids.alloc();

	//нужно выбирать доступный http_responder
	capsule.modules.http_responder.on_recv(context, 
				       function(content, response){
					   //проверить активно ли соединение
					   if(content == ''){
					       console.log('empty request');
					       return;
					   }
					   response.on_close(
					       function(){
						   var _responses = responses[_content.cli_id];
						   var rk = _responses.length -1;
						   while(rk >= 0){
						       if(responses[rk] == response)
							   responses.splice(rk, 1);
						       rk--;
						   }
					       });
					   var _content = JSON.parse(content);
					   
					   //client is connecting, first msg
					   var msg_connect = false;
					   if(_content.cli_id == 0){
					       _content.cli_id = ids.alloc();
					       msg_connect = true;
					   }
					   
					   //new msg
					   if(_content.hasOwnProperty('msg'))
					       _incoming.add(_content);
					   
					   //send delayed packet
					   if(_packets.length){
					       var packet = get_by_cli_id(_packets, _content.cli_id);
					       if(packet)
						   response.end(packet);
					   } else 
					       if(msg_connect)
						   //client is connecting, send allocated cli_id back
						   response.end(JSON.stringify({"cli_id" : _content.cli_id}));
					   else {
					       //nothing to send, save response object on the future
					       if(typeof(responses[_content.cli_id]) == 'undefined')
						   responses[_content.cli_id] = [];
					       responses[_content.cli_id].push(response);	     
					   }
				       },
				       function(nerror){_on_error_cb(new error(nerror.name, nerror.msg));});    
    };

    this.deactivate = function(context){
	capsule.modules.http_responder.remove_callback(context);	
	extra_cleaner_timer.destroy();
    };
}

function packet_sender(_holder){
    this.send = function(msg){
	var response = _holder.get_waited_response(msg.cli_id);
	if(response)
	    response.end(JSON.stringify(msg));
	else
	    _holder.delayed_packets.push([msg.cli_id, JSON.stringify(msg)]);
    };
}

exports.create = function(context, capsule){
    var utils = capsule.parts.utils;
    var _incoming = new utils.msg_queue();
    var _holder = new response_holder(_incoming, capsule);
    var _sender = new packet_sender(_holder);
    var _on_error_cb = function(erorr){
	console.log(JSON.stringify(error));
    };
    
    return {
	'listen' : function(){
	    _holder.activate(context);
	},
	'on_connect' : function(connect_cb){
	    var clients = {};
	    _incoming.on_add(function(msg){
				 if(typeof(clients[msg.cli_id]) == 'undefined'){
				     connect_cb({	    
						   'send' : function(data){
						       _sender.send({"cli_id" : msg.cli_id, "msg" : data});
						   },
						   'on_recv' : function(callback){
						       clients[msg.cli_id] = callback;  
						   }
					       });
				 } else
				     clients[msg.cli_id](msg.msg);
			     });
	},
	'on_error' : function(callback){
	    _on_error_cb = callback;
	    _holder.on_error(callback);
	},
	'close' : function(){
	    _holder.deactivate(context);
	}	    
	
    };
}

};module_loader.add("modules/transport/http/socket_srv.js",_socket_srv);current.socket_srv = module_loader.load('modules/transport/http/socket_srv.js');return current;})({});
return current;})({});
return current;})({});
return current;})({});
current.dependencies = (function(current){return current;})({});
return current;})({});
}
(function(env){ env.capsulated.main(env);})(constructor(new env.dependencies.module_loader()))