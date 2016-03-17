/*jshint node: true, esversion: 6, bitwise: false */

module.exports = function(grunt) {
  'use strict';
  
  var CacheBuster;

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
      css: true,
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

  return CacheBuster;

};