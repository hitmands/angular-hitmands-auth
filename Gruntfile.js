module.exports = function(grunt) {
   'use strict';
   require('jit-grunt')(grunt, {
      "ngtemplates" : "grunt-angular-templates"
   });

   var pkg = grunt.file.readJSON('package.json');

   var _banner = "/**!\n * @Project: <%= pkg.name %>\n * @Authors: <%= pkg.authors.join(', ') %>\n * @Link: <%= pkg.homepage %>\n * @License: MIT\n * @Date: <%= grunt.template.today('yyyy-mm-dd') %>\n * @Version: <%= pkg.version %>\n***/\n\n";

   grunt.config.init({
      pkg: pkg,

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
         },
         sample: {
            files: [
               {
                  src: './sample/dist/application.js',
                  dest: './sample/dist/application.js'
               }
            ]
         }
      },

      ngtemplates: {
         sample: {
            options: {
               module: 'hitmands.auth.sample.tpls',
               htmlmin: {
                  collapseBooleanAttributes:      true,
                  collapseWhitespace:             true,
                  removeAttributeQuotes:          true,
                  removeComments:                 true,
                  removeEmptyAttributes:          true,
                  removeRedundantAttributes:      true,
                  removeScriptTypeAttributes:     true,
                  removeStyleLinkTypeAttributes:  true
               },
               url: function(url) {
                  url = url.replace('./sample', '');
                  return url;
               }
            },
            src:      './sample/partials/**/*.html',
            dest:     './sample/dist/application-tpls.js'
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
         sampleDev: {
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
                     './sample/js/backend/backend.js',
                     './sample/js/application.js',
                     './sample/js/configs/**/*.js',
                     './sample/js/services/**/*.js',
                     './sample/js/auth/**/*.js',
                     './sample/js/pages/**/*.js',
                     '!./sample/dist/**/*.*'
                  ],
                  dest: './sample/dist/application.js'
               }
            ]
         },
         sample: {

            files: [
               {
                  src: [
                     './sample/js/backend/backend.js',
                     './sample/js/application.js',
                     './sample/js/configs/**/*.js',
                     './sample/js/services/**/*.js',
                     './sample/js/auth/**/*.js',
                     './sample/js/pages/**/*.js',
                     '!./sample/dist/**/*.*'
                  ],
                  dest: './sample/dist/application.js'
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
         },
         sample: {
            src: [
               'src/vendor/angular/angular.min.js',
               'src/vendor/angular-ui-router/release/angular-ui-router.min.js',
               'src/vendor/angular-bootstrap/ui-bootstrap.min.js',
               'src/vendor/angular-bootstrap/ui-bootstrap-tpls.js',
               'src/vendor/angular-mocks/angular-mocks.js',
               'src/vendor/angular-sanitize/angular-sanitize.min.js',
               'src/vendor/ngprogress-lite/ngprogress-lite.min.js'
            ],
            dest : 'sample/dist/application-lib.js',
            nonull: true
         }
      },

      inline: {
         options:{
            cssmin: true
         },
         sample: {
            src: './sample/__index.html',
            dest: './sample/dist/index.html'
         }
      },

      htmlmin: {
         sample: {
            options : {
               removeComments : true,
               collapseWhitespace : true
            },
            files : {
               './sample/dist/index.html' : './sample/dist/index.html'
            }
         }
      },

      shell: {
         karmaSingleRun: {
            command: 'karma start config/karma.js --single-run'
         }
      },

      watch: {
         compile: {
            tasks: ['default'],
            files: ['src/**/*.js']
         },
         frontend: {
            options: {
               livereload: true,
               spawn: false
            },
            files: [
               'sample/**/*.*',
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

   grunt.registerTask('release',
      [
         'uglify:development',
         'ngAnnotate:modules',
         'uglify:production',
         'concat:bannerize'
      ]
   );

   grunt.registerTask('sample', [
      'ngAnnotate:sample',
      'uglify:sampleDev',
      'ngtemplates:sample',
      'uglify:sample',
      'concat:sample',
      'inline:sample',
      'htmlmin:sample'
   ]);

   grunt.registerTask('prepareCommit', [
      'release',
      'shell:karmaSingleRun',
      'concat:mvLcov'
   ]);
};
