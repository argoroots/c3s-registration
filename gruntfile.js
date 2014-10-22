module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            build: {
                src: 'tmp'
            },
            postbuild: {
                src: ['tmp/assets']
            }
        },
        copy: {
            bootstrap: {
                cwd: 'bower_components/bootstrap/dist/css/',
                src: ['bootstrap.css'],
                dest: 'tmp/css',
                expand: true,
                // flatten: true,
            },
        },
        jade: {
            html: {
                // options: {
                //     pretty: true,
                // },
                files: [{
                    expand: true,
                    cwd: 'source/views',
                    src: ['index.jade'],
                    dest: 'tmp',
                    ext: '.html'
                }]
            }
        },
        stylus: {
            css: {
                files: {
                    'tmp/css/application.css': ['source/stylesheets/*.styl']
                }
            }
        },
        cssmin : {
            frameworks: {
                options: {
                    keepSpecialComments: 0,
                },
                files: {
                    'tmp/css/frameworks.css': ['tmp/css/*.css', '!tmp/css/application.css']
                }
            },
            application: {
                options: {
                    keepSpecialComments: 0,
                },
                files: {
                    'tmp/stylesheet.css': ['tmp/css/frameworks.css', 'tmp/css/application.css']
                }
            }
        },
        uglify: {
            frameworks: {
                // options: {
                //     mangle: false
                // },
                files: {
                    'tmp/javascripts/frameworks.js': [
                        'bower_components/angular/angular.js',
                        'bower_components/angular-route/angular-route.js',
                        'bower_components/angular-resource/angular-resource.js',
                        'bower_components/angular-sanitize/angular-sanitize.js'
                    ]
                }
            },
            application: {
                files: {
                    'tmp/javascript.js': ['tmp/javascripts/frameworks.js', 'source/javascripts/*.js']
                }
            }
        },
        includereplace: {
            all: {
                files: {
                    'index.html': ['tmp/index.html']
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 4000,
                    base: './',
                    hostname: 'localhost'
                }
            }
        },
        watch: {
            stylesheets: {
                files: 'source/**/*.styl',
                tasks: ['stylus', 'cssmin:application', 'jade', 'includereplace']
            },
            scripts: {
                files: 'source/**/*.js',
                tasks: ['uglify:application', 'jade', 'includereplace']
            },
            jade: {
                files: 'source/**/*.jade',
                tasks: ['jade', 'includereplace']
            },
        }
    })

    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-connect')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-contrib-cssmin')
    grunt.loadNpmTasks('grunt-contrib-jade')
    grunt.loadNpmTasks('grunt-contrib-less')
    grunt.loadNpmTasks('grunt-contrib-stylus')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-font-awesome-vars')
    grunt.loadNpmTasks('grunt-include-replace')

    grunt.registerTask(
        'prepare',
        'Compiles all of the assets and copies the files to the build directory.',
        ['clean:build', 'copy:bootstrap', 'jade', 'stylus', 'cssmin', 'uglify', 'includereplace']
    )

    grunt.registerTask(
        'build',
        'Compiles all of the assets and copies the files to the build directory. Cleanup all mess.',
        ['prepare', 'clean:postbuild']
    )

    grunt.registerTask(
        'default',
        'Watches the project for changes, automatically builds them and runs a server.',
        ['prepare', 'connect', 'watch']
    )
}
