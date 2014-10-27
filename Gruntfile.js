module.exports = function(grunt) {
   'use strict';

   require('jit-grunt')(grunt);

   var pkg = grunt.file.readJSON('package.json');
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
            jshintrc: './config/.jshintrc',
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
            htmlmin: {
               collapseWhitespace: true,
               removeAttributeQuotes: true,
               removeEmptyAttributes: true,
               removeComments: true,
               collapseBooleanAttributes: true
            }
         },
         files: [
            {
               src: '**/*.html',
               dest: './release/angular-hitmands-auth-tpl.js'
            }
         ]
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
                  sequences: false
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
                  var commentsWhiteList = /(jshint|@ngInject)/g;
                  var keepComment = false;

                  if( commentsWhiteList.test(comment.value) ) {
                     keepComment = true;
                  }

                  //if( comment.type = 'comment2') {
                  //   keepComment = true;
                  //}

                  return keepComment;
               }
            },
            files: [
               {
                  src: [
                     './src/*-module.js',
                     './src/*-provider.js',
                     './src/*-service.js',
                     './src/*-directives.js'
                  ],
                  dest: './release/angular-hitmands-auth.js'
               }
            ]
         },
         production: {
            options: {
               mangle: {
                  except: ['fsys']
               },
               compress: {
                  drop_console: true,
                  join_vars: true
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

   grunt.registerTask('release',
      [
         'uglify:development',
         'ngAnnotate',
         'uglify:production',
         'concat:bannerize'
      ]
   );

};

