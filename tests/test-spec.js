/*jshint node: true, esversion: 6, bitwise: false */

'use strict';

// dependencies
var assert = require('assert'),
  grunt = require('grunt'),
  path = require('path'),
  exec = require('child_process').exec;


// Tests Suites
describe("grunt-bust-cache", function() {

  it("should version CSS URLs", function(done) {
    exec('grunt bustCache:css', {
      cwd: path.join(__dirname, '..')
    }, function() {
      var expect = grunt.file.read('tests/fixtures/source.html'),
        result = grunt.file.read('target/css.html');
      assert.notEqual(result, expect);
      done();
    });
  });

  it("and should version JavaScript URLs", function(done) {
    exec('grunt bustCache:javascript', {
      cwd: path.join(__dirname, '..')
    }, function() {
      var expect = grunt.file.read('tests/fixtures/source.html'),
      result = grunt.file.read('target/javascript.html');
        assert.notEqual(result, expect);
      done();
    });
  });

  it("and should version RequireJS configurations", function(done) {
    exec('grunt bustCache:requireJs', {
      cwd: path.join(__dirname, '..')
    }, function() {
      var expect = grunt.file.read('tests/fixtures/source.html'),
      result = grunt.file.read('target/requireJs.html');
        assert.notEqual(result, expect);
      done();
    });
  });

  it("and should version a single file", function(done) {
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
