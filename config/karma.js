// Karma configuration
// Generated on Sun Oct 26 2014 12:21:57 GMT+0100 (CET)

module.exports = function(config) {
   config.set({

      // base path that will be used to resolve all patterns (eg. files, exclude)
      basePath: '..',


      // frameworks to use
      // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
      frameworks: ['jasmine'],


      // list of files / patterns to load in the browser
      files: [
         'src/vendor/angular/angular.js',
         'src/vendor/angular-mocks/angular-mocks.js',
         'src/vendor/angular-ui-router/release/angular-ui-router.js',
         'tests/**/*.js',
         'release/angular-hitmands-auth.js'
      ],


      // list of files to exclude
      exclude: [
         'src/vendor/'
      ],


      // preprocess matching files before serving them to the browser
      // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
      preprocessors: {
         './release/*.js': ['coverage']
      },


      // test results reporter to use
      // possible values: 'dots', 'progress'
      // available reporters:
      reporters: ['progress', 'coverage'],
      coverageReporter: {
         type : 'lcov',
         dir : './coverage/'
      },

      // web server port
      port: 9876,


      // enable / disable colors in the output (reporters and logs)
      colors: true,


      // level of logging
      // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
      logLevel: config.LOG_INFO,


      // enable / disable watching file and executing tests whenever any file changes
      autoWatch: true,

      // start these browsers
      // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
      browsers: ['PhantomJS'],


      // Continuous Integration mode
      // if true, Karma captures browsers, runs the tests and exits
      singleRun: false
   });
};
