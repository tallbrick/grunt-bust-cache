/*jshint node: true, esversion: 6, bitwise: false */

module.exports = function(grunt) {
  'use strict';
  
  var taskName, taskDescription, defaultOptions, VersionMaker, CacheBuster;

  taskName = 'bustCache';

  taskDescription = 'Updates your files with a version string appended to URLs.';

  defaultOptions = {
    css: true,
    requireJs: false,
    urlKey: "v",

    hashType: "timestamp", // git, npm, maven, timestamp
    pathToGitRepo: "./",
    pathToPom: "./pom.xml",
    pathToNpm: "./package.json"
  };


  VersionMaker = require('./libs/version-maker')(grunt);

  function getVersion(options){
    return new Promise(function(resolve, reject) {
      var version;
      try{
        // Calculate the version/hash
        version = new VersionMaker(options);
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

  function updateFiles(options, files){
    var cacheBuster, filesUpdated = [], message;

    // Update the files to include the version/hash
    cacheBuster = new CacheBuster(options);
    
    files.forEach(function(filePair) {
      filePair.src.forEach(function(src) {
        var dest, fileContent;

        if ( grunt.file.exists(src) ) {
          if (filePair.dest !== undefined) {
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
    var options, files = this.files;
    options = this.options(defaultOptions);

    // Set the files object
    if(this.files.length === 0){
      if(options.src !== undefined || options.files === undefined || options.files !== undefined){
        grunt.log.error(["Configuration Error:"]);
        grunt.log.error(["It looks like you may have defined your file paths in the options object - this won't work."]);
        grunt.log.error(["Instead, move the file paths out to the task-config block."]);
      }
      grunt.fail.warn('The `files` array was empty.');
    }

    // Perform the task
    getVersion(options)

    .then(function(){ updateFiles.call(this, options, files); }) // Update the files to include the version/hash

    .then(this.async(), grunt.warn) // Signal to grunt that the task is done

    .catch(grunt.warn);
  });
};