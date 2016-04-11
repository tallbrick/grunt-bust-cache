/*jshint node: true, esversion: 6, bitwise: false */

module.exports = function(grunt) {
  'use strict';
  
  var VersionOMatic, git, pomParser;

  git = require('gitty');
  pomParser = require("pom-parser");

  /*
   * Class the creates different types of hash strings
   */
  VersionOMatic = function(options){
    this.options = options;
  };

  VersionOMatic.prototype = {

    constructor: VersionOMatic,

    taskReference: null,

    options: {
      hashType: "timestamp", // git, npm, maven, timestamp
      pathToGitRepo: "./",
      pathToPom: "pom.xml"
    },

    calcHash: function(callback) {
      var promises = [], Instance = this,
      hashFunction, promise, hash = false;
      hashFunction = this.options.hashType;
      hashFunction = hashFunction.charAt(0).toUpperCase() + hashFunction.slice(1);
      /*
      if(typeof "get"+hashFunction+"Hash" === "function"){
        this["get"+hashFunction+"Hash"]().then(callback, grunt.warn);
      }
      */
      promises.push( this["get"+hashFunction+"Hash"]() );

      Promise.all(promises).then(callback, grunt.warn);
    },

    getTimestampHash: function() {
      var timestamp = Date.now() / 1000 | 0;
      return Promise.resolve( timestamp );
    },

    getNpmHash: function() {
      var pkg = grunt.file.readJSON('package.json');
      return Promise.resolve( pkg.version );
    },

    getGitHash: function() {
      var hash, cmdLastCommit;
      // "git rev-parse --verify HEAD"
      cmdLastCommit = new git.Command(this.options.pathToGitRepo, "rev-parse", ["--verify", "HEAD"]);
      hash = cmdLastCommit.execSync();
      hash = hash.replace("\n", '').substr(0,12); // remove newlines, shorten to 12 chars
      return Promise.resolve( hash );
    },

    getMavenHash: function() {
      var opts, done, version;

      // The required options, including the filePath.
      // Other parsing options from https://github.com/Leonidas-from-XIV/node-xml2js#options
      opts = {
        filePath: this.options.pathToPom,
      };
      
      return new Promise(function(resolve, reject) {
        pomParser.parse(opts, function(err, pomResponse) {
          if (err) {
            grunt.log.error(["ERROR: " + err]);
            return reject(ex);
          }else{
            version = pomResponse.pomObject.project.version
            return resolve( version );
          }
        });
      });
    }
  };

  return VersionOMatic;
};