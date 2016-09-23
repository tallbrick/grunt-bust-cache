/*jshint node: true, esversion: 6, bitwise: false */

'use strict';

// dependencies
var assert = require('assert'),
  grunt = require('grunt'),
  VersionMaker = require('../tasks/libs/version-maker')(grunt);


var testNotNull = function(value){
  return (value !== null);
};
var testIsInteger = function(value){
  return Number.isInteger(value);
};
var testIsString = function(value){
  return (typeof value === 'string');
};
var testValueGreaterThenZero = function(value){
  return (value > 0);
};
var testLengthGreaterThenZero = function(string){
  return (string.length > 0);
};

// Tests Suites
describe("A timestamp", function() {
  var version;
  beforeEach(function(done) {
    new Promise(function(resolve, reject) {
      var maker;
      try{
        maker = new VersionMaker({hashType: "timestamp"});
        maker.calcHash(function(hash) {
          version = hash[0];
          //grunt.log.writeln(["testIsInteger: "+ testIsInteger(version)]);
          resolve( hash );
        });
      }catch(e){ reject(e); }
    }).then(function(){ done(); });
  });

  it("should not be null", function(done) {
    assert.equal(testNotNull(version), true);
    done();
  });
  it("and should be an integer", function(done) {
    assert.equal(testIsInteger(version), true);
    done();
  });
  it("and should be a value greater than zero", function(done) {
    assert.equal(testValueGreaterThenZero(version), true);
    done();
  });
});


describe("A maven project version", function() {
  var version;
  beforeEach(function(done) {
    new Promise(function(resolve, reject) {
      var maker;
      try{
        maker = new VersionMaker({
          hashType: "maven",
          pathToPom: "./tests/fixtures/pom.xml"
        });
        maker.calcHash(function(hash) {
          version = hash[0];
          //grunt.log.writeln(["testIsString: "+ (typeof version)]);
          resolve( hash );
        });
      }catch(e){ reject(e); }
    }).then(function(){ done(); });
  });

  it("should not be null", function(done) {
    assert.equal(testNotNull(version), true);
    done();
  });
  it("and should be a string", function(done) {
    assert.equal(testIsString(version), true);
    done();
  });
  it("and length should be greater than zero", function(done) {
    assert.equal(testLengthGreaterThenZero(version), true);
    done();
  });
});


describe("A git commit hash", function() {
  var version;
  beforeEach(function(done) {
    new Promise(function(resolve, reject) {
      var maker;
      try{
        maker = new VersionMaker({
          hashType: "git", 
          pathToGitRepo: "./"
        });
        maker.calcHash(function(hash) {
          version = hash[0];
          resolve( hash );
        });
      }catch(e){ reject(e); }
    }).then(function(){ done(); });
  });

  it("should not be null", function(done) {
    assert.equal(testNotNull(version), true);
    done();
  });
  it("and should be a string", function(done) {
    assert.equal(testIsString(version), true);
    done();
  });
  it("and length should be greater than zero", function(done) {
    assert.equal(testLengthGreaterThenZero(version), true);
    done();
  });
});


describe("A npm project version", function() {
  var version;
  beforeEach(function(done) {
    new Promise(function(resolve, reject) {
      var maker;
      try{
        maker = new VersionMaker({hashType: "npm", pathToNpm: "./package.json"});
        maker.calcHash(function(hash) {
          version = hash[0];
          resolve( hash );
        });
      }catch(e){ reject(e); }
    })
    .then(function(){ done(); })
    .catch(function(err){ grunt.warn.writeln(err); });
  });

  it("should not be null", function(done) {
    assert.equal(testNotNull(version), true);
    done();
  });
  it("and should be a string", function(done) {
    assert.equal(testIsString(version), true);
    done();
  });
  it("and length should be greater than zero", function(done) {
    assert.equal(testLengthGreaterThenZero(version), true);
    done();
  });
});

