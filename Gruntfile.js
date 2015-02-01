module.exports = function(grunt) {
   'use strict';
   require('jit-grunt')(grunt, {
      "ngtemplates" : "grunt-angular-templates",
      "comments" : "grunt-stripcomments"
   });

   var pkg = grunt.file.readJSON('package.json');
   var fixtures = {
      users: grunt.file.read('./sample/js/fixtures/users.json')
   };
   var _banner = "/**!\n * @Project: <%= pkg.name %>\n * @Authors: <%= pkg.authors.join(', ') %>\n * @Link: <%= pkg.homepage %>\n * @License: MIT\n * @Date: <%= grunt.template.today('yyyy-mm-dd') %>\n * @Version: <%= pkg.version %>\n***/\n\n";

   grunt.config.init({
      pkg: pkg,

      githooks: {
         all: {
            'pre-commit': 'release'
         }
      },

      jshint: {
         options: {
            jshintrc: './.jshintrc',
            force: true
         },
         frontend: {
            src: [
               './release/**/*.js',
               '!./release/**/*.min.js'
            ]
         }
      },

      symlink: {
         options: {
            overwrite: false
         },
         vendor: {},
         views: {}
      },

      ngtemplates: {
         options: {
            bootstrap:  function(module, script) {
               return '(function(window, angular) {' +
                  '   angular.module("hitmands.auth.sample").run(function($templateCache) { ' + script + ' });\r\n' +
                  '   window.usersFixtures = ' +
                  fixtures.users +
                  ';' +
                  '})(window, angular);';
            },
            htmlmin: {
               collapseWhitespace: true,
               removeAttributeQuotes: true,
               removeEmptyAttributes: true,
               removeComments: true,
               collapseBooleanAttributes: true
            }
         },
         sample: {
            cwd: './sample/',
            src: ['views/**/*.html'],
            dest: './sample/js/templates-and-fixtures.js'
         }
      },

      ngAnnotate: {
         options: {
            singleQuotes: true
         },
         modules: {
            files: [
               {
                  src: './release/angular-hitmands-auth.js',
                  dest: './release/angular-hitmands-auth.js'
               }
            ]
         }
      },

      uglify: {
         development: {
            options: {
               mangle: false,
               sourceMap: true,
               compress: {
                  sequences: false,
                  unused: false
               },
               beautify: {
                  indent_level: 3,
                  indent_start: 3,
                  ascii_only: true,
                  beautify: true,
                  bracketize: true,
                  semicolons: true,
                  quote_keys: true,
                  width: 80
               },
               banner: "(function(window, angular) {\n   'use strict';\n",
               footer: '\n\n})(window, angular);',
               preserveComments: function(node, comment) {
                  var whiteList = /(jshint|@ngInject|@preserve)/g;
                  var keepComment = false;

                  if( whiteList.test(comment.value) ) {
                     keepComment = true;
                  }

                  return keepComment;
               }
            },
            files: [
               {
                  src: [
                     './src/auth-module.js',
                     './src/auth-helpers.js',
                     './src/auth-provider.js',
                     './src/auth-directives.js'
                  ],
                  dest: './release/angular-hitmands-auth.js'
               }
            ]
         },
         production: {
            options: {
               mangle: {
                  except: ['AuthCurrentUser']
               },
               compress: {
                  drop_console: true,
                  join_vars: true,
                  unused: true
               },
               beautify: {
                  ascii_only: true,
                  beautify: false
               },
               sourceMap: false,
               preserveComments: false,
               report: 'gzip',
               footer: '\n'
            },
            files: [
               {
                  src: './release/angular-hitmands-auth.js',
                  dest: './release/angular-hitmands-auth.min.js'
               }
            ]
         }
      },

      concat: {
         bannerize: {
            options: {
               banner: _banner
            },
            files: [
               {
                  src: './release/angular-hitmands-auth.js',
                  dest: './release/angular-hitmands-auth.js'
               },
               {
                  src: './release/angular-hitmands-auth.min.js',
                  dest: './release/angular-hitmands-auth.min.js'
               }
            ]
         },
         mvLcov: {
            src: './coverage/PhantomJS 1.9.8 (Mac OS X)/lcov.info',
            dest : './lcov.info',
            nonull: true
         }
      },

      shell: {
         karmaSingleRun: {
            command: 'karma start config/karma.js --single-run'
         }
      },

      comments: {
         release: {
            options: {
               singleline: true,
               multiline: true
            },
            src: [ 'release/**/*.js']
         }
      },

      watch: {
         compile: {
            tasks: ['default'],
            files: ['src/**/*.js']
         },
         sample: {
            tasks: ['default'],
            files: ['src/**/*.js']
         },
         frontend: {
            options: {
               livereload: true,
               spawn: false
            },
            files: [
               'src/**/*.html',
               'release/**/*.js'
            ]
         }
      }

   });


   grunt.registerTask('default',
      [
         'newer:uglify:development',
         'newer:ngAnnotate',
         'newer:jshint:frontend'
      ]
   );

   grunt.registerTask('sample',
      [
         'ngtemplates'
      ]
   );

   grunt.registerTask('stripJavascriptComments',
      [
         'comments:release'
      ]
   );

   grunt.registerTask('release',
      [
         'uglify:development',
         'ngAnnotate',
         'uglify:production',
         'concat:bannerize'
      ]
   );

   grunt.registerTask('prepareCommit', [
      'release',
      'shell:karmaSingleRun',
      'concat:mvLcov'
   ]);
};
