'use strict';

module.exports = function (grunt) {

    // https://github.com/shootaroo/jit-grunt
    require('jit-grunt')(grunt);

    grunt.loadNpmTasks('grunt-contrib-compress');

    var module = grunt.option("module") || 'login';

	var compressFilter = function(name) {
		if (name.match(/mehuge-chat\\chat-config.js/)) return false;
		if (name.match(/mehuge-announcer\\.*\.ogg/) && name.indexOf('Wilhelm') === -1) return false;
		return true;
	};

	var mehugeUIs = function(UIs) {
		var a = [];
		UIs.forEach(function(UI) {
			a.push('mehuge-'+UI+'.ui');
			a.push('mehuge-'+UI+'/**');
			a.push('!**/*.ts');
		});
		return a;
	};

	var singleUI = function(name, libs) {
		var files = [];
		if (libs) {
			for (var i = 0; i < libs.length; i++) {
				files.push({ src: [ libs[i] + '/*.js', libs[i] + '/*.js.map' ], filter: 'isFile' });
			}
		}
		files.push({ src: mehugeUIs([ name ]), filter: compressFilter });
		return {
			options: { archive: 'dist/mehuge-'+name+'.zip' },
			files: files
		};
	};

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        connect: {
            server: {
                options: {
                    port: 8080,
                    base: './'
                }
            }
        },

        ts: {

            dev: {
                src: ['**/*.ts', '!node_modules/**', '!.tscache/**'],
                vs: {
                    project: 'UI.csproj',
                    config: 'Debug',
                    ignoreFiles: true
                }
            },

            debug: {
                vs: {
                    project: 'UI.csproj',
                    config: 'Debug'
                }
            },

            release: {
                vs: {
                    project: 'UI.csproj',
                    config: 'Release'
                }
            }
        },

        watch: {
            files: ['./**/*.ts', '!./node_modules/**'],
            tasks: ['ts:dev']
        },

        open: {
            dev: {
                path: 'http://localhost:8080/' + module + '/' + module + '.html'
            }
        },

		dist: {
			release: {
			}
		},

		compress: {

			// mehuge-full.zip
			"mehuge-full.zip": {
				options: { archive: 'dist/mehuge-full.zip' },
				files: [
					// Libraries
					{ src: [ 'mehuge/*.js', 'mehuge/*.js.map' ], filter: 'isFile' },
					{ src: [ 'vendor/flot/*.js', 'vendor/cu-rest/*.js' ], filter: 'isFile' },
					// UIs
					{ src: mehugeUIs([ 
							'announcer', 'autoexec', 'bct', 'chat', 'combatlog', 'deathspam', 'group', 
							'heatmap', 'lb', 'lights', 'loc', 'perf', 'pop', 'tweaks'
							]),
					  filter: compressFilter }
				]
			},

			// Individual UI ZIPs
			"mehuge-announcer.zip": singleUI('announcer'),
			"mehuge-bct.zip": 		singleUI('bct'),
			"mehuge-combatlog.zip": singleUI('combatlog'),
			"mehuge-chat.zip": 		singleUI('combatlog', [ 'mehuge' ]),
			"mehuge-deathspam.zip": singleUI('deathspam'),
			"mehuge-group.zip": 	singleUI('group', [ 'mehuge' ]),
			"mehuge-heatmap.zip": 	singleUI('heatmap', [ 'mehuge', 'vendor/cu-rest' ]),
			"mehuge-lb.zip": 		singleUI('lb', [ 'vendor/cu-rest' ]),
			"mehuge-lights.zip": 	singleUI('lights'),
			"mehuge-loc.zip": 		singleUI('loc', [ 'vendor/cu-rest' ]),
			"mehuge-perf.zip": 		singleUI('perf', [ 'vendor/flot' ]),
			"mehuge-pop.zip": 		singleUI('pop', [ 'vendor/cu-rest' ]),
			"mehuge-tweaks.zip": 	singleUI('tweaks')

		}

    });

	grunt.registerTask('default', []);
    grunt.registerTask('build', ['ts:dev']);
    grunt.registerTask('dist', ['dist:release']);

};
