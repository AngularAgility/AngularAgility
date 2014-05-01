module.exports = function (grunt) {

    var banner = '/*! <%= pkg.name %> v<%= pkg.version %> @ <%= grunt.template.today("isoDateTime") %> */\n\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
                banner: banner
            },
            dist: {
                src: ['src/*.js'],
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
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
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

    grunt.registerTask('default', ['build', 'ngdocs']);

};
