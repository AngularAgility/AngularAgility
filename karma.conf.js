/*globals module */
// Karma configuration
// Generated on Fri Jan 31 2014 16:00:59 GMT-0600 (CST)

module.exports = function (config) {
  'use strict';
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['jasmine'],


    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-coverage'
    ],

    // list of files / patterns to load in the browser
    files: [
      // libs
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.19/angular.js',

      // tests
      "http://ajax.googleapis.com/ajax/libs/angularjs/1.2.19/angular-mocks.js",
      'test/**/*.js',

      // src
      'src/*.js',
      'src/formExtensions/*.js',
      'src/formExtensions/directives/*.js'
    ],


    // list of files to exclude
    exclude: [

    ],

    preprocessors: {
      '**/src/**/*.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      reporters: [
        {type: 'json', dir: 'coverage/'},
        {type: 'html', dir: 'coverage/'}
      ]
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit'
    reporters: ['progress', 'coverage'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
