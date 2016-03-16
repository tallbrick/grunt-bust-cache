/*jshint node: true, esversion: 6, bitwise: false */

module.exports = function(grunt) {
  'use strict';
  
  var taskName, taskDescription, defaultOptions, CacheBuster, VersionOMatic, pomParser, git;

  taskName = 'cacheBuster';

  taskDescription = 'Updates your files with a version string appended to URLs.';

  defaultOptions = {
    css: true,
    requireJs: false,
    urlKey: "v",

    hashType: "timestamp", // git, npm, maven, timestamp
    pathToGitRepo: "./",
    pathToPom: "pom.xml"
  }

  /*
   * Class that updates file content (string) with a version/hash
   */
  CacheBuster = function(options){
    this.options = options;
  };

  CacheBuster.prototype = {

    constructor: CacheBuster,

    options: {
      urlKey: "v",
      requireJs: false,
      javascript: true,
      css: false,
      versionString: ""
    },

    updateFileContent(fileContent) {
      if(this.options.requireJs){
        fileContent = this.bustRequireJs(fileContent);
      }

      if(this.options.javascript){
        fileContent = this.bustJavaScript(fileContent);
      }

      if(this.options.css){
        fileContent = this.bustCss(fileContent);
      }

      return fileContent;
    },

    // Add requirejs config which includes hash string
    bustRequireJs(fileContent) {
      var hash;
      hash = '<script>var require = { urlArgs: "'+ this.options.urlKey +'='+ this.options.versionString+'" };</script>';
      fileContent = fileContent.replace(/(<script data-main=(.*(require.js)*.)><\/script>)/gim, hash +"$1");
      return fileContent;
    },

    // Add hash string to JS includes
    bustJavaScript(fileContent) {
      var hash;   
      hash = '?'+this.options.urlKey+'='+ this.options.versionString;
      fileContent = fileContent.replace(/(<script.*)(\w+\.js)(.*>.*<\/script>)/gim, "$1$2"+ hash +"$3");
      return fileContent;
    },

    // Add hash string to CSS includes
    bustCss(fileContent) {
      var hash;   
      hash = '?'+this.options.urlKey+'='+ this.options.versionString;
      fileContent = fileContent.replace(/(<link.*)(\w+\.css)(.*\/>)/gim, "$1$2"+ hash +"$3");
      return fileContent;
    }
  };


  /*
   * Class the creates different types of hash strings
   */
  git = require('gitty');
  pomParser = require("pom-parser");

  //options.hashType: "timestamp", // git, npm, maven, timestamp
  VersionOMatic = function(options){
    this.options = options;
  };

  VersionOMatic.prototype = {

    constructor: VersionOMatic,

    taskReference: null,

    options: {},

    calcHash(callback){
      var promises = [], Instance = this,
      hashFunction, promise, hash = false;
      hashFunction = this.options.hashType;
      hashFunction = hashFunction.charAt(0).toUpperCase() + hashFunction.slice(1);

      promises.push( this["get"+hashFunction+"Hash"]() );

      Promise.all(promises).then(callback, grunt.warn);
    },

    getTimestampHash() {
      var timestamp = Date.now() / 1000 | 0;
      return Promise.resolve( timestamp );
    },

    getNpmHash() {
      var pkg = grunt.file.readJSON('package.json');
      return Promise.resolve( pkg.version );
    },

    getGitHash() {
      var hash, cmdLastCommit;
      // "git rev-parse --verify HEAD"
      cmdLastCommit = new git.Command(this.options.pathToGitRepo, "rev-parse", ["--verify", "HEAD"]);
      hash = cmdLastCommit.execSync();
      hash = hash.replace("\n", '').substr(0,12); // remove newlines, shorten to 12 chars
      return Promise.resolve( hash );
    },

    getMavenHash() {
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

  function getVersionHash(resolve, reject, options){
    var version;
    try{
      // Calculate the version/hash
      version = new VersionOMatic(options);
      version.calcHash(function(hash) {
        options.versionString = hash;
        grunt.log.writeln(["cache-buster suffix: "+ options.versionString]); 

        resolve( options );
      });
    }catch(e){
      reject(e);
    }
  }

  function updateFiles(options){
    var cacheBuster, filesUpdated = [], message;

    // Update the files to include the version/hash
    cacheBuster = new CacheBuster(options);

    this.files.forEach((filePair) => {
      filePair.src.forEach((src) => {
        var dest, fileContent;

        if ( grunt.file.exists(src) ) {
          if (filePair.dest !== undefined && grunt.file.exists(filePair.dest)) {
            dest = filePair.dest;
          } else {
            dest = src;
          }

          fileContent = grunt.file.read(src);
          fileContent = cacheBuster.updateFileContent(fileContent);
          
          grunt.file.write(dest, fileContent);
          filesUpdated.push(dest);
        }
      });
    });

    if( filesUpdated.length > 0 ){
      message = "Files Updated: "+ filesUpdated.join('\n');
    }else{
      message = "No Files updated";
    }
    grunt.log.writeln([message]);
  }


  /*
   * Grunt Task
   */
  grunt.registerMultiTask(taskName, taskDescription, function() {
    var options;
    options = this.options(defaultOptions);

    new Promise(function (resolve, reject) {
      getVersionHash(resolve, reject, options);
    })

    // Update the files to include the version/hash
    .then(() => { updateFiles.call(this, options); })

    // Signal to grunt that the task is done
    .then(this.async(), grunt.warn);
  });
};