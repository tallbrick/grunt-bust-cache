/*jshint node: true, esversion: 6, bitwise: false */

module.exports = function(grunt) {
  'use strict';
  
  var taskName, taskDescription, defaultOptions, VersionOMatic, CacheBuster;

  taskName = 'bustCache';

  taskDescription = 'Updates your files with a version string appended to URLs.';

  defaultOptions = {
    css: true,
    requireJs: false,
    urlKey: "v",

    hashType: "timestamp", // git, npm, maven, timestamp
    pathToGitRepo: "./",
    pathToPom: "pom.xml"
  };


  VersionOMatic = require('./libs/version-o-matic')(grunt);

  function promiseToGetVersion(options){
    return new Promise(function(resolve, reject) {
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
    });
  }

  
  CacheBuster = require('./libs/cache-buster')(grunt);

  function updateFiles(options){
    var cacheBuster, filesUpdated = [], message;

    // Update the files to include the version/hash
    cacheBuster = new CacheBuster(options);

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

    promiseToGetVersion(options)

    .then(function(){ updateFiles.call(this, options) }) // Update the files to include the version/hash

    .then(this.async(), grunt.warn) // Signal to grunt that the task is done

    .catch(grunt.warn);
  });
};