'use strict';

module.exports = function (grunt) {
  var _ = require('lodash');
  var uuid = require('uuid');

  grunt.file.defaultEncoding = 'utf-8';
  require('load-grunt-tasks')(grunt);
  grunt.task.loadTasks('tools/grunt');

  var buildConfig = require('./build.config.js');

  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    cacheBuster: '', // will be set when one of the deployment tasks is used

    /**
     * The banner is the comment that is placed at the top of our compiled
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner: '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' */\n'
    },

    /**
     * Creates a changelog on a new version.
     */
    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        template: 'changelog.tpl'
      }
    },

    /**
     * Increments the version number, etc.
     */
    bump: {
      options: {
        files: [
          'package.json',
          'bower.json'
        ],
        commit: false,
        commitMessage: 'chore(release): v%VERSION%',
        commitFiles: [
          'package.json',
          'client/bower.json'
        ],
        createTag: false,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'origin'
      }
    },

    /**
     * The directories to delete when `grunt clean` is executed.
     */
    clean: [
      '<%= build_dir %>',
      '<%= compile_dir %>'
    ],

    /**
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      buildAppAssets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= build_dir %>/assets/',
            cwd: 'src/assets',
            expand: true
          }
        ]
      },
      buildAppBranding: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= build_dir %>/branding/',
            cwd: 'src/branding',
            expand: true
          }
        ]
      },
      buildVendorAssets: {
        files: [
          {
            src: [ '<%= vendor_files.assets %>' ],
            dest: '<%= build_dir %>/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      },
      buildAppjs: {
        files: [
          {
            src: [ '<%= app_files.js %>', 'favicon.ico' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      buildApp: {
        files: [
          {
            src: [ 'favicon.ico' ],
            dest: '<%= build_dir %>/',
            cwd: '<%= src_dir %>/',
            expand: true
          }
        ]
      },
      buildVendorjs: {
        files: [
          {
            src: [ '<%= vendor_files.js %>' ],
            dest: '<%= build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      compileApp: {
        files: [
          {
            src: [ 'favicon.ico', '.htaccess' ],
            dest: '<%= compile_dir %>/',
            cwd: '<%= src_dir %>/',
            expand: true
          }, {
            src: [ '<%= build_dir %>/config.json' ],
            dest: '<%= compile_dir %>/config.json'
          }
        ]
      },
      compileAssets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/assets',
            cwd: '<%= build_dir %>/assets',
            expand: true
          }
        ]
      },
      compileBranding: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= compile_dir %>/branding',
            cwd: '<%= build_dir %>/branding',
            expand: true
          }
        ]
      }
    },

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /**
       * The `buildCss` target concatenates compiled CSS and vendor CSS
       * together.
       */
      buildCss: {
        src: [
          '<%= vendor_files.css %>',
          '<%= less.build.destFile %>'
        ],
        dest: '<%= less.build.destFile %>'
      },
      /**
       * The `compileJs` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      compileJs: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= vendor_files.js %>',
          'module.prefix',
          '<%= build_dir %>/src/**/*.js',
          '<%= build_dir %>/app/config.js',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'module.suffix'
        ],
        dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %><%= cacheBuster %>.js'
      }
    },

    /**
     * `ng-min` annotates the sources before minifying. That is, it allows us
     * to code without the array syntax.
     */
    ngmin: {
      compile: {
        files: [
          {
            src: [ '<%= app_files.js %>' ],
            cwd: '<%= build_dir %>',
            dest: '<%= build_dir %>',
            expand: true
          }
        ]
      }
    },

    /**
     * Minify the sources
     */
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>',
          sourceMap: true
        },
        files: {
          '<%= concat.compileJs.dest %>': '<%= concat.compileJs.dest %>'
        }
      }
    },

    /**
     * `less` handles our LESS compilation and uglification automatically.
     * Only our `main.less` file is included in compilation; all other files
     * must be imported from this file.
     */
    less: {
      build: {
        destFile: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %><%= cacheBuster %>.css',
        options: {
          paths: ['<%= src_dir %>/less', '<%= vendor_dir %>']
        },
        files: {
          '<%= less.build.destFile %>': '<%= app_files.less %>'
        }
      },
      compile: {
        destFile: '<%= less.build.destFile %>',
        options: {
          paths: ['<%= src_dir %>/less', '<%= vendor_dir %>/bootstrap/less', 'vendor/font-awesome/less', 'vendor/pickadate/lib/compressed/themes'],
          cleancss: true
        }
      },
      branding_example: {
        options: {
          compress: false,
          cleancss: false,
        },
        files: {
          './build/branding/style.css': '<%= src_dir %>/less/branding-example.less'
        }
      }
    },

    /**
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {
      src: [
        'src/app/**/*.js',
        'src/common/**/*.js'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },


    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src/app'
        },
        src: [ '<%= app_files.atpl %>' ],
        dest: '<%= build_dir %>/templates-app.js'
      },

      /**
       * These are the templates from `src/common`.
       */
      common: {
        options: {
          base: 'src/common'
        },
        src: [ '<%= app_files.ctpl %>' ],
        dest: '<%= build_dir %>/templates-common.js'
      }
    },

    connect: {
      options: {
        port: 9000,
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '<%= build_dir %>'
          ]
        }
      },
      coverage: {
        options: {
          port: 9001,
          open: true,
          base: 'test/coverage/www'
        }
      },
      bin: {
        options: {
          open: true,
          keepalive: true,
          base: 'bin',
          livereload: false
        }
      }
    },

    index: {
      // un-minified
      build: {
        dir: '<%= build_dir %>',
        src: [
          '<%= vendor_files.js %>',
          '<%= build_dir %>/src/**/*.js',
          '<%= build_dir %>/app/config.js',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>',
          '<%= less.build.destFile %>'
        ]
      },

      // minified
      compile: {
        dir: '<%= compile_dir %>',
        src: [
          '<%= concat.compileJs.dest %>',
          '<%= less.compile.destFile %>'
        ]
      }
    },

    ngconstant: {
      options: {
        space: '  '
      },
      development: [
        {
          dest: '<%= build_dir %>/app/config.js',
          name: 'openwheels.environment',
          constants: {
            ENV: 'development'
          }
        }
      ],
      production: [
        {
          dest: '<%= build_dir %>/app/config.js',
          name: 'openwheels.environment',
          constants: {
            ENV: 'production' // sets $logProvider.debugEnabled(false), see app.js
          }
        }
      ]
    },

    autoprefixer: {
      build: {
        options: {
          diff: true
        },
        src: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %><%= cacheBuster %>.css' // globbing is also possible here
      }
    },

    watch: {
      options: {
        livereload: true
      },

      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ],
        options: { livereload: false }
      },

      jssrc: {
        files: [
          '<%= app_files.js %>'
        ],
        tasks: [ 'jshint:src', 'karma:background:run', 'copy:buildAppjs' ]
      },

      testSpecs: {
        files: ['test/unit/**/*.spec.js'],
        tasks: ['karma:background:run']
      },

      config: {
        files: [
          'config/**',
        ],
        tasks: [ 'configure' ]
      },

      assets: {
        files: [
          'src/assets/**/*'
        ],
        tasks: [ 'copy:buildAppAssets' ]
      },

      branding: {
        files: [
          'src/branding/**/*'
        ],
        tasks: [ 'copy:buildAppBranding' ]
      },

      html: {
        files: [ '<%= app_files.html %>' ],
        tasks: [ 'index:build' ]
      },

      tpls: {
        files: [
          '<%= app_files.atpl %>',
          '<%= app_files.ctpl %>'
        ],
        tasks: [ 'html2js' ]
      },

      less: {
        files: [ 'src/**/*.less' ],
        tasks: [ 'less:build', 'autoprefixer:build' ],
        options: { livereload: false }
      },

      livereload: {
        options: {
          livereload: true,
        },
        files: [
          '<%= build_dir %>/assets/**/*.css',
          '<%= build_dir %>/**/*.html',
          '<%= build_dir %>/**.js'
        ]
      }
    },

    manifest: {
      compile: {
        options: {
          basePath: './bin'
        },
        src: [
          '**/*.jpg',
          '**/*.js',
          '**/*.css',
          '**/*.ico',
          '**/*.png',
          '**/*.json',
          '**/*.woff',
          '**/*.eot',
          '**/*.ttf'
        ],
        dest: 'bin/manifest.appcache'
      }
    },

    karma: {
      options: {
        configFile: './test/unit/config/karma.conf.js',
        reporters: ['progress', 'coverage'],
        preprocessors: {
          'src/**/*.js': ['coverage']
        },
        coverageReporter: {
          type: 'html',
          dir : 'test/coverage/',
          subdir: 'www'
        }
      },
      background: {
        background: true,
        singleRun: false
      },
      autoWatch: {
        autoWatch: true
      },
      singleRun: {
        singleRun: true
      }
    },

    synclocale: {
      options: {
        base: 'src/assets/locale'
      },
      nl_en: {
        source: 'nl_NL.json',
        target: 'en_GB.json',
        save_as: 'en_GB.json'
      }
    }

  };

  var coverageConfig = {
    watch: {
      coverage: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: 'test/coverage/**/*.*'
      }
    }
  };

  grunt.initConfig(grunt.util._.extend(gruntConfig, buildConfig));

  // run local server
  grunt.registerTask('server', [
    'build-common',
    'configure',
    'ngconstant:development',
    'index:build',
    'connect:livereload',
    'karma:singleRun',
    'karma:background:start',
    'watch'
  ]);

  // run unit tests once
  grunt.registerTask('unit', ['karma:singleRun']);

  // run unit tests in background
  grunt.registerTask('unit-watch', ['karma:autoWatch']);

  // open coverage report (+ livereload, so can't be used at the same time as 'grunt server')
  grunt.registerTask('coverage', function () {
    grunt.initConfig(grunt.util._.extend(gruntConfig, buildConfig, coverageConfig));
    grunt.task.run(['karma:singleRun', 'connect:coverage', 'watch:coverage']);
  });

  // sync locale files
  grunt.registerTask('locale', ['synclocale:nl_en']);

  // deploy
  grunt.registerTask('dist-dev', ['initWithCacheBuster', 'build-common', 'ngconstant:development' , 'compile']);
  grunt.registerTask('dist'    , ['initWithCacheBuster', 'build-common', 'ngconstant:production'  , 'compile']);

  grunt.registerTask('initWithCacheBuster', function () {
    grunt.initConfig(grunt.util._.extend(gruntConfig, buildConfig, {
      cacheBuster: '-' + uuid.v4().slice(-12)
    }));
  });

  grunt.registerTask('build-common', [
    'clean', 'html2js', 'jshint:src', 'less:build', 'autoprefixer:build', 'concat:buildCss',
    'copy:buildAppAssets', 'copy:buildAppBranding', 'copy:buildApp', 'copy:buildVendorAssets',
    'copy:buildAppjs', 'copy:buildVendorjs'
  ]);

  grunt.registerTask('compile', [
    'less:compile', 'copy:compileAssets', 'copy:compileBranding', 'copy:compileApp', 'ngmin', 'concat:compileJs', 'uglify', 'index:compile'
  ]);

  grunt.registerMultiTask('index', 'Process index.html template', function () {
    var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');
    var jsFiles = filterForJS(this.filesSrc).map(function (file) {
      return file.replace(dirRE, '');
    });
    var cssFiles = filterForCSS(this.filesSrc).map(function (file) {
      return file.replace(dirRE, '');
    });

    grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
      process: function (contents) {
        return grunt.template.process(contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config('pkg.version')
          }
        });
      }
    });
  });

  // write config
  grunt.registerTask('configure', function () {
    var config = require('./config/config.js');
    var features = require('./config/features.js');
    grunt.file.write(grunt.config('build_dir') + '/branding/config.json', JSON.stringify(config, null, 2));
    grunt.file.write(grunt.config('build_dir') + '/branding/features.json', JSON.stringify(features, null, 2));
  });

  /**
   * A utility function to get all app JavaScript sources.
   */
  function filterForJS(files) {
    return files.filter(function (file) {
      return file.match(/\.js$/);
    });
  }

  /**
   * A utility function to get all app CSS sources.
   */
  function filterForCSS(files) {
    return files.filter(function (file) {
      return file.match(/\.css$/);
    });
  }

};
