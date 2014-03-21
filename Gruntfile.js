module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
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
				scripts: ['src/aa.formExtensions.js'],
				title: 'Angular Agility - Form Extensions',
				startPage: ''
			},
			all:['src/aa.formExtensions.js']
		}
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-ngdocs');
	
    grunt.registerTask('test', ['jshint', 'karma:continuous']);
    grunt.registerTask('build', ['test', 'concat', 'uglify']);

    grunt.registerTask('default', ['build', 'ngdocs']);

};