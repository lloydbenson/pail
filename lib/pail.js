var Fs = require('fs');
var Path = require('path');
var Uuid = require('node-uuid');

var internals = {
    defaults: {
        pailFile: 'config.json',
        mainPath: '/tmp',
        pailPath: 'pail',
        workspacePath: 'workspace' 
    }
};

internals.mkdirp = function (dirpath) {
  
  var parts = dirpath.split('/');
  for ( var i = 2; i <= parts.length; i++ ) {

    var dir = parts.slice(0, i).join('/');
    if ( ! Fs.existsSync(dir) ) {
       
            //console.log('making dir: ' + dir);
        	Fs.mkdirSync ( dir );
    }
  }
}

exports.getDirs = function (dirpath) {

    var list = Fs.readdirSync(dirpath);
    var dirs = [];
    for(var i = 0; i < list.length; i++) {

        var filename = Path.join(dirpath, list[i]);
        var stat = Fs.lstatSync(filename);
        if (stat.isDirectory()) {
            var path = filename.split('/');
	    var dir = path[path.length-1];
            dirs.push(dir);
        }
/*
        else {
           // skip because its a file
        }
*/
    }
    return dirs;
};

exports.getPails = function () {

    var pailPath = internals.defaults.mainPath + '/' + internals.defaults.pailPath;
    var pails = this.getDirs(pailPath);
    return pails;
};

exports.savePail = function (config) {
   //console.log('saving with config: ' + JSON.stringify(config));
   if (!config.id) {
       config.id = Uuid.v4();
   }
   var pailPath = internals.defaults.mainPath + '/' + internals.defaults.pailPath + '/' + config.id;
   internals.mkdirp(pailPath);
   var pailFile = pailPath + '/' + internals.defaults.pailFile;
   if (config.status === 'succeeded' || config.status === 'failed' || config.status === 'cancelled') {
       config.finishTime = new Date().getTime();
   }
   else if (config.status === 'starting') {
       config.startTime = new Date().getTime();
       config.status = 'started';
   }
   Fs.writeFileSync(pailFile, JSON.stringify(config,null,4));
   return config;
};

exports.getPail = function (pail_id) {

   var pailPath = internals.defaults.mainPath + '/' + internals.defaults.pailPath + '/' + pail_id;
   var pailFile = pailPath + '/' + internals.defaults.pailFile;
   var config = Fs.readFileSync(pailFile, "utf8");
   return JSON.parse(config);
};

exports.deletePail = function (pail_id) {

   var pailPath = internals.defaults.mainPath + '/' + internals.defaults.pailPath + '/' + pail_id;
   var pailFile = pailPath + '/' + internals.defaults.pailFile;
   Fs.unlinkSync(pailFile);
   Fs.rmdirSync(pailPath);
};