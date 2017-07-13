module.exports = {
	options: {
		space: '  ',
		wrap: '\'use strict\';\n\n {%= __ngModule %}',
		name: 'config'
	},
	apiary: {
		options: {
			dest: '<%= yeoman.app %>/scripts/config.js'
		},
		constants: {
			ENV: {
				name: 'apiary',				
				apiEndpoint: 'http://private-ae6fd-cedarwood.apiary-mock.com',			
				pusherKey: '3ea0911334b61a35ba30',
				pusherFileEventProcessDelay:'30', //in seconds
				debugEnabled: true
			}
		}
	},
	naren: {
		options: {
			dest: '<%= yeoman.app %>/scripts/config.js'
		},
		constants: {
			ENV: {
				name: 'naren',				
				apiEndpoint: 'http://localhost',
				appHost: 'http://localhost:9000',
				pusherKey: 'bf376e7c78452444c51b',
				pusherFileEventProcessDelay:'30', //in seconds
				debugEnabled: true
			}
		}
	},
	local: {
		options: {
			dest: '<%= yeoman.app %>/scripts/config.js'
		},
		constants: {
			ENV: {
				name: 'local',				
				// apiEndpoint: 'http://54.86.174.186:9000/api',
				apiEndpoint: 'http://localhost',
				appHost: 'http://localhost:9000',
				pusherKey: 'bf376e7c78452444c51b',
				debugEnabled: true
			}
		}
	},
	dev: {
		options: {
			dest: '<%= yeoman.app %>/scripts/config.js'
		},
		constants: {
			ENV: {
				name: 'development',				
				apiEndpoint: 'http://localhost:9000/api',
				appHost: 'http://52.23.242.137:9000',
				pusherKey: '3ea0911334b61a35ba30',
				pusherFileEventProcessDelay:'30', //in seconds
				debugEnabled: true
			}
		}
	},
	jay: {
		options: {
			dest: '<%= yeoman.app %>/scripts/config.js'
		},
		constants: {
			ENV: {
				name: 'development',
				apiEndpoint: 'http://192.168.99.100/api',
				pusherKey: '3ea0911334b61a35ba30',
				pusherFileEventProcessDelay:'30' //in seconds
			}
		}
	},
	chris: {
		options: {
			dest: '<%= yeoman.app %>/scripts/config.js'
		},
		constants: {
			ENV: {
				name: 'development',
				apiEndpoint: 'http://cedarwoodconsulting',
				appHost: 'http://localhost:9000',
				pusherKey: '3ea0911334b61a35ba30',
				pusherFileEventProcessDelay:'30', //in seconds
				debugEnabled: true
			}
		}
	},
};
