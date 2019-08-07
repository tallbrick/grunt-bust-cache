/*jshint node: true, esversion: 6, bitwise: false */
/* eslint-disable global-require */

module.exports = function(grunt) {
  'use strict';
  
  var VersionMaker, git, pomParser;

  git = require('gitty');
  pomParser = require("pom-parser");

  /*
   * Class the creates different types of hash strings
   */
  VersionMaker = function(options){
    this.options = options;
  };

  VersionMaker.prototype = {

    constructor: VersionMaker,

    taskReference: null,

    // Defaults
    options: {
      // Options Include: git, npm, maven, timestamp
      hashType: "timestamp",
      // Executes the git command: "git rev-parse --verify HEAD"
      pathToGitRepo: "./",
      // Reads the Maven version number
      pathToPom: "./pom.xml",
      // Reads the NPM Project version number
      pathToNpm: "./package.json"
    },

    calcHash: function(callback) {
      var promises = [], hashFunction;
      hashFunction = this.options.hashType;
      
      // Create dynamic call to the correct getter method
      hashFunction = hashFunction.charAt(0).toUpperCase() + hashFunction.slice(1);
      /*
      if(typeof "get"+hashFunction+"Hash" === "function"){
        this["get"+hashFunction+"Hash"]().then(callback, grunt.warn);
      }
      */
      promises.push( this["get" + hashFunction + "Hash"]() );

      Promise.all(promises).then(callback, grunt.warn);
    },

    getTimestampHash: function() {
      var timestamp = Date.now() / 1000 | 0;
      timestamp = Number(timestamp);
      return Promise.resolve( timestamp );
    },

    getNpmHash: function() {
      //grunt.log.writeln(["this.options.pathToNpm: " + this.options.pathToNpm]);
      var version, pkg = grunt.file.readJSON(this.options.pathToNpm);
      version = String(pkg.version);
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
      var opts, version;

      // The required options, including the filePath.
      // Other parsing options from https://github.com/Leonidas-from-XIV/node-xml2js#options
      opts = {
        filePath: this.options.pathToPom
      };
      
      return new Promise(function(resolve, reject) {
        pomParser.parse(opts, function(err, pomResponse) {
          if (err) {
            grunt.log.error(["ERROR: " + err]);
            return reject(err);
          }else{
            version = String(pomResponse.pomObject.project.version);
            return resolve( version );
          }
        });
      });
    }
  };

  return VersionMaker;
};