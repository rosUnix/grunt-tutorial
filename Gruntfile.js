'use strict';

module.exports = function (grunt) {

    [   'grunt-contrib-jshint',
        'grunt-contrib-sass',
        'grunt-contrib-connect',
        'grunt-contrib-jasmine',
        'grunt-contrib-watch',
        'grunt-open',
        'grunt-contrib-clean',
        'grunt-contrib-copy',
        'grunt-contrib-compress',
        'grunt-contrib-qunit',
        'grunt-contrib-requirejs',
        'grunt-contrib-less'
    ].forEach(grunt.loadNpmTasks);

    var sassFiles = [{
        expand: true,
        cwd: 'app/sass/',
        dest: 'app/css/§',
        src: '**/*.{sass, scss}',
        ext: '.css'
    }];

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        // JSHINT -----------------------------------------------

        jshint: {
            options: {
                node: true
            },
            all: [
                'Gruntfile.js',
                'app/js/**/*.js',
                '!app/js/vendor/**/*.js',
                'app/test/**/*.js'
            ]
        },

        // Compress SASS ----------------------------------------

        sass: {
            options: {
                cacheLocation: '.tmp/.sass-cache'
            },
            dev: {
                options: {
                    style: 'expanded',
                    lineComments: true
                },
                files: sassFiles
            },
            prod: {
                options: {
                    style: 'compressed'
                },
                files: sassFiles
            }
        },

        less: {
            dev: {
                options: {
                    paths: ['app/less']
                },
                files: {
                    'app/css/styles.css': 'app/less/styles.less'
                }
            },
            prod: {
                options: {
                    paths: ['app/less'],
                    yuicompress: true
                },
                files: {
                    'app/css/styles.css': 'app/less/styles.less'
                }
            }
        },

        // REQUIREJS -------------------------------------------------

        requirejs: {
            compile: {
                options: {
                    baseUrl: 'app/js',
                    name: 'example',
                    include: [
                        'goblin',
                        'autosuggest_view',
                        'date_time_view',
                        'date_view'
                    ],
                    out: 'app/app.min.js',
                    optimize: 'uglify'
                }
            }
        },

        // SERVER ------------------------------------------------

        connect: {
            server: {
                options: {
                    port: 9000,
                    middleware: function (connect) {
                        var path = require('path');
                        return [
                            connect.static(path.resolve('app')),
                            connect.static(path.resolve('.tmp'))
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001
                }
            }
        },

        // TESTS ---------------------------------------------------

        jasmine: {
            shell: {
                options: {
                    specs: ['app/test/specs/**/*_spec.js'],
                    vendor: ['app/js/vendor/**/*.js'],
                    outfile: 'app/test/index.html'
                },
                src: ['app/js/**/*.js', '!app/js/vendor/**/*.js']
            }
        },

        qunit: {
            all: ['app/test/index.html']
        },

        // WATCH -------------------------------------------------------

        watch: {
            sass: {
                files: ['app/sass/*.{sass,scss}'],
                tasks: ['sass:dev']
            }
        },

        // OPEN BROWSER ------------------------------------------------

        open: {
            server: {
                path: 'http://0.0.0.0:9000'
            },
            test: {
                path: 'http://0.0.0.0:9001/app/test/index.html'
            }
        },

        // CLEAN -------------------------------------------------------

        clean: {
            all: ['.tmp', '.grunt', 'app/css', 'app/test/index.html',
                    'build', '*.tar.gz']
        },

        // RELEASES -----------------------------------------------------

        copy: {
            release: {
                files: [{
                    expand: true,
                    cwd: 'app',
                    dest: 'build',
                    src: ['*.html', 'js/**/*', 'images/**/*']
                }, {
                    expand: true,
                    cwd: '.tmp',
                    dest: 'build',
                    src: ['styles/*']
                }]
            }
        },

        // TARBALL -----------------------------------------------------

        compress: {
            release: {
                options: {
                    archive: '<%= pkg.name %>-<%= pkg.version %>.tar.gz'
                },
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: ['**/*']
                }]
            }
        }
    });

    grunt.registerTask('test', 'Running test in comand line', [
        'jshint', 'jasmine'
    ]);

    grunt.registerTask('runtest', 'Running tests', [
        'jshint', 'jasmine:shell:build', 'connect:test', 'open:test', 'watch'
    ]);

    grunt.registerTask('qunit', 'Running tests', [
        'jshint', 'qunit', 'connect:test', 'open:test', 'watch'
    ]);

    grunt.registerTask('server', 'Run server', [
        'jshint', 'sass:dev', 'connect:server', 'open:server', 'watch'
    ]);

    grunt.registerTask('release', 'Generate a release tarball', [
        'sass:prod', 'test', 'clean', 'copy:release', 'compress:release'
    ]);
};