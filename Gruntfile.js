module.exports = function (grunt) {

    var banner =
        '/*\n<%= pkg.name %> v<%= pkg.version %> @ <%= grunt.template.today("isoDateTime") %>\n' +
        'Copyright (c) 2014 - John Culviner\n' +
        'Licensed under the MIT license\n*/\n\n';

    //appears repetitive but this gets the files in the correct orders
    var sources = ['src/*.js', 'src/formExtensions/*.js', 'src/formExtensions/**/*.js'];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        src: sources,

        concat: {
            options: {
                separator: ';',
                banner: banner
            },
            dist: {
                src: sources,
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                browsers: ['Chrome']
            },
            continuous: {
                singleRun: true,
                browsers: ['PhantomJS']
            },
            dev: {
                reporters: 'dots'
            }
        },
        watch: {
            files: sources,
            tasks: ['build']
        },
		ngdocs: {
			options:{
				dest:'docs',
				html5Mode:true,
				scripts: [ 'docs/js/angular.min.js','src/aa.formExtensions.js','src/aa.notify.js','src/aa.select2.js','src/aa.formExternalConfiguration.js'],
				title: 'Angular Agility - Form Extensions',
				startPage: '/api/aa.formExtensions'
			},
			all:['src/aa.formExtensions.js']
		},
		copy: {
			main:{
				files:[{
					expand:true,
					src:['docs/**'],
					dest:'demo/'
				}]
			}
		}
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-ngdocs');
	
    grunt.registerTask('test', ['jshint', 'karma:continuous']);
    grunt.registerTask('build', ['test', 'concat', 'uglify']);
    grunt.registerTask('dev', ['build', 'watch']);


    grunt.registerTask('default', ['build', 'ngdocs']);
};
