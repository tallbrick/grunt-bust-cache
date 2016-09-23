
'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks("gruntify-eslint");
  grunt.loadTasks('tasks');

  grunt.initConfig({

    // Configurable paths
    pathTo: {
      tasks: './tasks',
      tests: './tests',
      fixtures: './tests/fixtures',
      build: './target'
    },

    jshint: {
      options: {
        "boss": true,
        "curly": true,
        "eqeqeq": true,
        "eqnull": true,
        "immed": true,
        "latedef": true,
        "newcap": true,
        "noarg": true,
        "node": true,
        "sub": true,
        "undef": true,
        "unused": true,
        "mocha": true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      tasks: {
        src: ['<%= pathTo.tasks %>/**/*.js']
      },
      test: {
        src: ['<%= pathTo.tests %>/**/*.js']
      }
    },

    eslint: {
      options: {
        //silent: true,
        //rulePaths: ["./.eslintrc"]
        useEslintrc: true
      },
      src: ['<%= pathTo.tasks %>/**/*.js']
    },

    clean: {
      test: ['<%= pathTo.build %>']
    },

    copy: {
      tests: {
        files: [
          {
            src: '<%= pathTo.fixtures %>/source.html',
            dest: '<%= pathTo.build %>/singleFile.html'
          }
        ]
      }
    },

    bustCache: {
      // Version Types
      timestamp: {
        options: { hashType: "timestamp" },
        src: "<%= pathTo.fixtures %>/source.html",
        dest: "<%= pathTo.build %>/timestamp.html"
      },
      npm: {
        options: {
          hashType: "npm",
          pathToPom: "./package.json"
        },
        src: "<%= pathTo.fixtures %>/source.html",
        dest: "<%= pathTo.build %>/npm.html"
      },
      maven: {
        options: {
          hashType: "maven",
          pathToPom: "./tests/fixtures/pom.xml"
        },
        src: "<%= pathTo.fixtures %>/source.html",
        dest: "<%= pathTo.build %>/maven.html"
      },
      git: {
        options: { hashType: "git" },
        src: "<%= pathTo.fixtures %>/source.html",
        dest: "<%= pathTo.build %>/git.html"
      },

      // Replacement Types
      css: {
        options: {
          css: true,
          requireJs: false,
          javascript: false
        },
        src: "<%= pathTo.fixtures %>/source.html",
        dest: "<%= pathTo.build %>/css.html"
      },
      requireJs: {
        options: {
          css: false,
          requireJs: true,
          javascript: false
        },
        src: "<%= pathTo.fixtures %>/source.html",
        dest: "<%= pathTo.build %>/requireJs.html"
      },
      javascript: {
        options: {
          css: false,
          requireJs: false,
          javascript: true
        },
        src: "<%= pathTo.fixtures %>/source.html",
        dest: "<%= pathTo.build %>/javascript.html"
      },

      // Option configs
      singleFile: {
        src: "<%= pathTo.build %>/singleFile.html"
      },
      multiplePairs: {
        files: [
          {
            src: "<%= pathTo.fixtures %>/source.html",
            dest: "<%= pathTo.build %>/multiple/destination.html"
          }
        ]
      },
      
      // Negative Tests
      noFiles: {},
      badConfig: {
        options: [
          {
            src: "<%= pathTo.fixtures %>/source.html",
            dest: "<%= pathTo.build %>/destination.html"
          }
        ]
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: 'tests/**/*.js'
      }
    }
  });

  grunt.registerTask('test', ['clean', 'copy', 'mochaTest']);
  grunt.registerTask('default', ['jshint', 'eslint', 'test']);

};