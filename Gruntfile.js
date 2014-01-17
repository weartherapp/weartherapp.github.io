module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Wipe out previous builds and test reporting.
    clean: {
      main: {
        src: ['<%= grunt.option("path") %>'],
      }
    },

    // Run your source code through JSHint's defaults.
    jshint: ['app/**/*.js'],

    // This task simplifies working with CSS inside Backbone Boilerplate
    // projects.  Instead of manually specifying your stylesheets inside the
    // HTML, you can use `@imports` and this task will concatenate only those
    // paths.
    styles: {
      // Out the concatenated contents of the following styles into the below
      // development file path.
      'dist/styles.css': {
        // Point this to where your `index.css` file is location.
        src: 'app/styles/index.css',

        // The relative path to use for the @imports.
        paths: ['app/styles'],

        // Rewrite image paths during release to be relative to the `img`
        // directory.
        forceRelative: '/app/img/'
      }
    },

    // Minfiy the distribution CSS.
    cssmin: {
      main: {
        expand: true,
        src: ['<%= grunt.option("path") %>public/vendor/*.css',
            '!<%= grunt.option("path") %>public/vendor/*.min.css',
            '<%= grunt.option("path") %>public/css/wearther-media.css',
            '<%= grunt.option("path") %>public/css/wearther.css'],
        dest: '.'
      }
    },

    server: {
      options: {
        host: '0.0.0.0',
        port: 8000
      },

      development: {},

      release: {
        options: {
          prefix: 'dist'
        }
      },

      test: {
        options: {
          forever: false,
          port: 8001
        }
      }
    },

    processhtml: {
      staging: {
        options: {
          data: {
            file: 'js/wearther-<%= pkg.version %>.js'
          }
        },
        files: {
          'build/staging/latest/public/index.html': ['public/index.html']
        }
      },
      production: {
        options: {
          data: {
            file: 'js/wearther-<%= pkg.version %>.js'
          }
        },
        files: {
          'build/production/<%= pkg.version %>/public/index.html':
              ['public/index.html']
        }
      }
    },

    concat: {
      main: {
        src: [
          'public/js/main.js',
          'public/js/Util.js',

          'public/js/modules/errordisplay/ErrorDisplay.js',
          'public/js/modules/settings/Settings.js',
          'public/js/modules/router/Router.js',

          'public/js/modules/location/models/location.js',
          'public/js/modules/location/views/location.js',
          'public/js/modules/location/Location.js',

          'public/js/modules/temperature/models/temperature.js',
          'public/js/modules/temperature/views/temperature.js',
          'public/js/modules/temperature/Temperature.js',

          'public/js/modules/combination/models/combination.js',
          'public/js/modules/combination/collections/combinations.js',
          'public/js/modules/combination/views/combination.js',
          'public/js/modules/combination/views/combinations.js',
          'public/js/modules/combination/Combination.js',

          'public/js/modules/listings/models/listing.js',
          'public/js/modules/listings/collections/listings.js',
          'public/js/modules/listings/views/listing.js',
          'public/js/modules/listings/views/listings.js',
          'public/js/modules/listings/Listings.js',

          'public/js/WeartherApp.js'
        ],

        dest: '<%= grunt.option("path") %>public/js/wearther-<%= pkg.version %>.js'
      }
    },

    // Move vendor and app logic during a build.
    copy: {
      staging: {
        files: [{
          expand: true,
          dot: true,
          src: ['public/**', 'server/**',
              '!public/js/**', '!public/index.html',
              '!**/bower_components/**', '!**.DS_Store',
              'package.json', 'Procfile'],
          dest: '<%= grunt.option("path") %>'
        }]
      },
      production: {
        files: [{
          expand: true,
          dot: true,
          src: ['public/**', 'server/**',
              '!public/js/**', '!public/index.html',
              '!**/bower_components/**', '!**.DS_Store',
              'package.json', '.ebextensions/**'],
          dest: '<%= grunt.option("path") %>'
        }]
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'

        // fix sourcemap later...
        // sourceMap: function(path) {
        //   return path.replace(/.js$/,'.map');
        // }
      },
      main: {
        files: [{
          expand: true,
          cwd: '<%= grunt.option("path") %>public/js',
          src: 'wearther-<%= pkg.version %>.js',
          dest: '<%= grunt.option("path") %>public/js'
        }, {
          expand: true,
          cwd: '<%= grunt.option("path") %>public/vendor',
          src: '*.js',
          dest: '<%= grunt.option("path") %>public/vendor',
        }]
      }
    },

    compress: {
      staging: {
        options: {
          mode: 'zip',
          archive: 'build/staging/latest.zip'
        },
        expand: true,
        dot: true,
        cwd: '<%= grunt.option("path") %>',
        src: ['**/*']
      },
      production: {
        options: {
          mode: 'zip',
          archive: 'build/production/<%= pkg.version %>.zip'
        },
        files: [{
          cwd: '<%= grunt.option("path") %>',
          expand: true,
          dot: true,
          src: ['**']
        }]
      }
    },

    // Unit testing is provided by Karma.  Change the two commented locations
    // below to either: mocha, jasmine, or qunit.
    karma: {
      options: {
        basePath: process.cwd(),
        singleRun: true,
        captureTimeout: 7000,
        autoWatch: true,
        logLevel: 'ERROR',

        reporters: ['dots', 'coverage'],
        browsers: ['PhantomJS'],

        // Change this to the framework you want to use.
        frameworks: ['mocha'],

        plugins: [
          'karma-jasmine',
          'karma-mocha',
          'karma-qunit',
          'karma-phantomjs-launcher',
          'karma-coverage'
        ],

        preprocessors: {
          'app/**/*.js': 'coverage'
        },

        coverageReporter: {
          type: 'lcov',
          dir: 'test/coverage'
        },

        files: [
          // You can optionally remove this or swap out for a different expect.
          'vendor/bower/chai/chai.js',
          'vendor/bower/requirejs/require.js',
          'test/runner.js',

          { pattern: 'app/**/*.*', included: false },
          // Derives test framework from Karma configuration.
          {
            pattern: 'test/<%= karma.options.frameworks[0] %>/**/*.spec.js',
            included: false
          },
          { pattern: 'vendor/**/*.js', included: false }
        ]
      },

      // This creates a server that will automatically run your tests when you
      // save a file and display results in the terminal.
      daemon: {
        options: {
          singleRun: false
        }
      },

      // This is useful for running the tests just once.
      run: {
        options: {
          singleRun: true
        }
      }
    },

    coveralls: {
      options: {
        coverage_dir: 'test/coverage/PhantomJS 1.9.2 (Linux)/'
      }
    },

    less: {
      website: {
        options: {
        },
        files: {
          'css/main.css': 'less/main.less'
        }
      }
    },

    watch: {
      options: {
        livereload: false
      },
      html: {
        files: ['**/*.html','!bower_components/**', '!node_modules/**']
      },
      js: {
        files: ['**/*.js', '!bower_components/**', '!node_modules/**']
      },
      grunt: {
        files: 'Gruntfile.js',
        options: {
          livereload: false
        }
      },
      less: {
        files: ['**/*.less', '!bower_components/**', '!node_modules/**'],
        tasks: ['less:website']
      }
    }
  });

  // Grunt contribution tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Third-party tasks.
  grunt.loadNpmTasks('grunt-processhtml');

  grunt.registerTask('type', 'Set build type (staging/production)',
      function(type) {
    if (type === 'staging') {
      grunt.option('path', 'build/staging/latest/');
    } else if (type === 'production') {
      grunt.option('path', 'build/production/<%= pkg.version %>/');
    } else {
      grunt.log.writeln('Invalid type');
      return;
    }
  });

  grunt.registerTask('staging', [
    'type:staging',
    'clean',
    'concat:main',
    'processhtml:staging',
    'copy:staging',
    'uglify:main',
    'cssmin:main'
  ]);

  grunt.registerTask('production', [
    'type:production',
    'clean',
    'concat:main',
    'processhtml:production',
    'copy:production',
    'uglify:main',
    'cssmin:main',
    // compress does not include hidden files (.ebextensions)
    'compress:production'
  ]);

  grunt.registerTask('website', [
    'less:website'
  ]);
};
