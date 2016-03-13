/*jshint node: true, esversion: 6, bitwise: false */

module.exports = function(grunt) {
  'use strict';
  
  var CacheBuster, VersionOMatic, pomParser, git;

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

  VersionOMatic = function(options){
    this.options = options;
  };

  VersionOMatic.prototype = {

    constructor: VersionOMatic,

    taskReference: null,

    options: {},

    get hash() {
      var hashFunction, hash = false;
      hashFunction = this.options.hashType;
      hashFunction = hashFunction.charAt(0).toLowerCase() + hashFunction.slice(1);

      hash = this[hashFunction+"Hash"];
      return hash;
    },

    get timestampHash() {
      return Date.now() / 1000 | 0;
    },

    get npmHash() {
      var pkg = grunt.file.readJSON('package.json');
      return pkg.version;
    },

    get gitHash() {
      var hash, cmdLastCommit;
      // "git rev-parse --verify HEAD"
      cmdLastCommit = new git.Command(this.options.pathToGitRepo, "rev-parse", ["--verify", "HEAD"]);
      hash = cmdLastCommit.execSync();
      return hash.replace("\n", '').substr(0,12); // remove newlines, shorten to 12 chars
    },

    get mavenHash() {
      var opts, done, version;

      // The required options, including the filePath.
      // Other parsing options from https://github.com/Leonidas-from-XIV/node-xml2js#options
      opts = {
        filePath: this.options.pathToPom,
      };
      
      // Parse the pom based on a path
      done = this.taskReference.async();
      pomParser.parse(opts, (err, pomResponse) => {
        var success = true;
        if (err) {
          grunt.log.error(["ERROR: " + err]);
          process.exit(1);
          success = false;
        }else{
          version = pomResponse.pomObject.project.version;
          this.writeCacheBustString(version);
        }
        done(success);
      });
      return version;
    }
  };


  /*
   * Grunt Task
   */
  grunt.registerMultiTask('cacheBuster', 'Updates your files with a version string appended to URLs.', function() {
    var options, version, cacheBuster, filesUpdated = [];

    options = this.options({
      css: true,
      requireJs: false,
      urlKey: "v",

      hashType: "timestamp", // git, npm, maven, timestamp
      pathToGitRepo: "./",
      pathToPom: "pom.xml"
    });

    // Calculate the version/hash
    version = new VersionOMatic(options);
    options.versionString = version.hash;
    grunt.log.writeln(["cache-buster suffix: "+ options.versionString]);

    // Update the files to include the version/hash
    cacheBuster = new CacheBuster(options);
    cacheBuster.taskReference = this;

    this.files.forEach(function(filePair) {
      filePair.src.forEach(function(src) {
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

    grunt.log.writeln(["Files Updated: "+ filesUpdated.join('\n')]);
  });
};