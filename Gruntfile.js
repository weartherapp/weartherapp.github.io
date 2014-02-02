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

    // Move vendor and app logic during a build.
    copy: {
      production: {
        files: [{
          expand: true,
          dot: true,
          src: ['**', '!less/**',
              '!build/**', '!js/**', '!node_modules/**',
              '!Gruntfile.js', '!*.sublime*',
              '!bower_components/**', '!**.DS_Store'],
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

  grunt.registerTask('production', [
    'type:production',
    'clean',
    'less',
    'processhtml:production',
    'copy:production',
    'uglify:main',
    'cssmin:main'
  ]);

  grunt.registerTask('website', [
    'less:website'
  ]);
};
