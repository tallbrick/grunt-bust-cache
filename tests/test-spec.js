/*jshint node: true, esversion: 6, bitwise: false */

'use strict';

// dependencies
var assert = require('assert'),
  grunt = require('grunt'),
  path = require('path'),
  exec = require('child_process').exec;


var testArraysMatch = function(needles, haystack){
  var x, l, match = true;
  if(needles && needles.length){
    for(x=0, l=needles.length;x<l;x++){
      if(haystack.indexOf(needles[x]) === -1){
        match = false;
      }
    }
  }
  return match;
};
var getCss = function(str){
  str = str.match(/<link.*\w+\.css.*\/>/gim);
  return (str !== null)? str : "";
};
var getJavaScript = function(str){
  str = str.match(/<script.*\w+\.js.*>.*<\/script>/gim);
  return (str !== null)? str : "";
};
var getRequireJsConfig = function(str){
  str = str.match(/<script>var require = { urlArgs: ".*" };<\/script>/gim);
  return (str !== null)? str : "";
};


// Tests Suites
describe("grunt-bust-cache", function() {

  it("should version CSS URLs", function(done) {
    this.timeout(5000);
    exec('grunt bustCache:css', {
      cwd: path.join(__dirname, '..')
    }, function() {
      var expect, result;
      expect = grunt.file.read('tests/fixtures/source.html');
      result = grunt.file.read('target/css.html');

      // Confirm that the file was versioned
      assert.notEqual(result, expect);

      // Confirm that ONLY the CSS Strings are versioned
      assert(testArraysMatch(getJavaScript(expect), getJavaScript(result)));
      assert(testArraysMatch(getRequireJsConfig(expect), getRequireJsConfig(result)));
      done();
    });
  });

  it("and should version JavaScript URLs", function(done) {
    this.timeout(5000);
    exec('grunt bustCache:javascript', {
      cwd: path.join(__dirname, '..')
    }, function() {
      var expect, result;
      expect = grunt.file.read('tests/fixtures/source.html');
      result = grunt.file.read('target/javascript.html');

      // Confirm that the file was versioned
      assert.notEqual(result, expect);

      // Confirm that ONLY the JavaScript strings are versioned
      assert(testArraysMatch(getCss(expect), getCss(result)));
      assert(testArraysMatch(getRequireJsConfig(expect), getRequireJsConfig(result)));
      done();
    });
  });

  it("and should version RequireJS configurations", function(done) {
    this.timeout(5000);
    exec('grunt bustCache:requireJs', {
      cwd: path.join(__dirname, '..')
    }, function() {
      var expect, result;
      expect = grunt.file.read('tests/fixtures/source.html');
      result = grunt.file.read('target/requireJs.html');

      // Confirm that the file was versioned
      assert.notEqual(result, expect);

      // Confirm that ONLY the RequireJS strings are versioned
      assert(testArraysMatch(getCss(expect), getCss(result)));
      done();
    });
  });

  it("and should version a single file", function(done) {
    this.timeout(5000);
    exec('grunt bustCache:singleFile', {
      cwd: path.join(__dirname, '..')
    }, function() {
      var expect = grunt.file.read('tests/fixtures/source.html'),
        result = grunt.file.read('target/singleFile.html');
      assert.notEqual(result, expect);
      done();
    });
  });

  it("and should version multiple file pairs", function(done) {
    this.timeout(5000);
    exec('grunt bustCache:multiplePairs', {
      cwd: path.join(__dirname, '..')
    }, function() {
      var expect = grunt.file.read('tests/fixtures/source.html'),
        result = grunt.file.read('target/multiple/destination.html');
      assert.notEqual(result, expect);
      done();
    });
  });

  it("and should error when file paths are mis-configured", function(done) {
    exec('grunt bustCache:badConfig', {
      cwd: path.join(__dirname, '..')
    }, function(error, stdout) {
      assert.notEqual(stdout.indexOf('Configuration Error'), -1);
      done();
    });
  });

  it("and should warn when no files are detected", function(done) {
    exec('grunt bustCache:noFiles', {
      cwd: path.join(__dirname, '..')
    }, function(error, stdout) {
      assert.notEqual(stdout.indexOf('The `files` array was empty.'), -1);
      done();
    });
  });
});
