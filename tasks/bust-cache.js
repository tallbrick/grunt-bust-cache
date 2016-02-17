
module.exports = function(grunt) {
  'use strict';

  var pomParser = require("pom-parser");
  var git = require('gitty');
  var task;
  var options;

  grunt.registerMultiTask('cacheBuster', 'Generates a version string to append to URLs.', function() {

    var configHtml, lastCommitHash, fileContent;
    task = this;

    options = this.options({
      devMode: false,
      entryPointHtml: {
        src: "src/main/resources/templates",
        dest: "target/project/main/resources/templates"
      }
    });

    if (options.devMode) {
      lastCommitHash = getLastCommitHash();
      writeCacheBustString(lastCommitHash);
    }else{
      getMavenProjectVersion();
    }
  });

  var writeCacheBustString = function(versionString){
    var fileContent;
    grunt.log.writeln(["cache-buster suffix: "+ versionString]);

    fileContent = grunt.file.read(options.entryPointHtml.src);

    fileContent = writeRequireJsConfig(fileContent, versionString);
    fileContent = writeCssVersion(fileContent, versionString);

    grunt.file.write(options.entryPointHtml.dest, fileContent);
  };

  var writeRequireJsConfig = function(fileContent, versionString){
    var configHtml;

    configHtml = '<script>var require = { urlArgs: "v='+versionString+'" };</script>';
    fileContent = fileContent.replace(/(<script data-main=(.*(require.js)*.)><\/script>)/gim, configHtml +"$1");
    return fileContent;
  };

  var writeJsVersion = function(fileContent, versionString){
    var configHtml;   

    configHtml = '?v='+versionString;
    fileContent = fileContent.replace(/(<script.*)(\w+\.js)(.*>.*<\/script>)/gim, "$1$2"+ configHtml +"$3");
    return fileContent;
  };

  var writeCssVersion = function(fileContent, versionString){
    var configHtml;   

    configHtml = '?v='+versionString;
    fileContent = fileContent.replace(/(<link.*)(\w+\.css)(.*\/>)/gim, "$1$2"+ configHtml +"$3");
    return fileContent;
  };


  var getLastCommitHash = function (pathToGitRepo){
    pathToGitRepo = pathToGitRepo || "./";
    var hash, cmdLastCommit;
    // "git rev-parse --verify HEAD"
    cmdLastCommit = new git.Command(pathToGitRepo, "rev-parse", ["--verify", "HEAD"]);
    hash = cmdLastCommit.execSync();
    return hash.replace("\n", '').substr(0,12); // remove newlines, shorten to 12 chars
  };

  var getMavenProjectVersion = function (pathToPom){
    pathToPom = pathToPom || "pom.xml";
    var opts, done, version;

    // The required options, including the filePath.
    // Other parsing options from https://github.com/Leonidas-from-XIV/node-xml2js#options
    opts = {
      filePath: pathToPom,
    };
    
    // Parse the pom based on a path
    done = task.async();
    pomParser.parse(opts, function(err, pomResponse) {
      var success = true;
      if (err) {
        grunt.log.error(["ERROR: " + err]);
        process.exit(1);
        success = false;
      }else{
        version = pomResponse.pomObject.project.version;
        writeCacheBustString(version);
      }
      done(success);
    });
    return version;
  };

  var detectDestType = function(dest) {
    if (grunt.util._.endsWith(dest, '/')) {
      return 'directory';
    } else {
      return 'file';
    }
  };
};