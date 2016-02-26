/*globals module, require */
module.exports = function (grunt) {
  'use strict';
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var banner =
    '/*\n<%= pkg.name %> "version":"<%= pkg.version %>" @ <%= grunt.template.today("isoDateTime") %>\n' +
    'Copyright (c) 2014 - John Culviner\n' +
    'Licensed under the MIT license\n*/\n\n';

  //appears repetitive but this gets the files in the correct orders
  var sources = ['src/*.js', 'src/formExtensions/*.js', 'src/formExtensions/**/*.js'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    src: sources,

    bump: {
      options: {
        files: ['package.json', 'bower.json', 'dist/angular-agility.js', 'dist/angular-agility.min.js'],
        updateConfigs: ['pkg'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['-a'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
      }
    },
    coverage: {
      options: {
        thresholds: {
          'statements': 30,
          'branches': 17,
          'lines': 30,
          'functions': 28
        },
        dir: 'coverage',
        root: ''
      }
    },
    concat: {
      options: {
        separator: ';',
        banner: banner
      },
      dist: {
        src: sources,
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: banner
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: [
        'Gruntfile.js',
        'karma.conf.js',
        'src/**/*.js',
        'demo/**/*.js',
        '!demo/lib/**/*.js',
        '!demo/docs/**/*.js'
      ],
      options: {
        jshintrc: true
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome']
      },
      continuous: {
        singleRun: true,
        browsers: ['PhantomJS']
      },
      dev: {
        reporters: 'dots'
      }
    },
    watch: {
      files: sources,
      tasks: ['build']
    },
    ngdocs: {
      options: {
        dest: 'docs',
        scripts: ['angular.js', 'dist/angular-agility.min.js'],
        html5Mode: true,
        startPage: '/api',
        title: "Angular Agility",
        titleLink: "/api",
        bestMatch: true
      },
      api: {
        src: ['src/*.js', 'src/**/*.js', '!src/**/*.spec.js'],
        title: 'API Documentation'
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['docs/**'],
            dest: 'demo/'
          }
        ]
      }
    }
  });

  grunt.registerTask('test', ['jshint', 'karma:continuous', 'coverage']);
  grunt.registerTask('build', [/*'test',*/ 'concat', 'uglify']);
  grunt.registerTask('dev', ['build', 'watch']);

  grunt.registerTask('release', ['build', 'bump']);

  grunt.registerTask('default', ['build']);
};
