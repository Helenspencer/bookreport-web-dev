module.exports = {
	options: {
		jshintrc: ".jshintrc"
	},
	all: ["Gruntfile.js", '<%= yeoman.app %>/scripts/{,*/}*.js',
		'!<%= yeoman.app %>/scripts/vendors/**',
		'!<%= yeoman.app %>/scripts/directives.js',
		'!<%= yeoman.app %>/scripts/factory.js',
		'!<%= yeoman.app %>/scripts/services.js',
		'!<%= yeoman.app %>/scripts/widgets.js',
		'!<%= yeoman.app %>/scripts/xenon-custom.js',
		'!<%= yeoman.app %>/scripts/shared/localize.js',
		'!<%= yeoman.app %>/scripts/controllers/sidebar.js',
		'!<%= yeoman.app %>/scripts/controllers/main.js',
		'!<%= yeoman.app %>/scripts/controllers.js',
		'!<%= yeoman.app %>/scripts/app.js',
		'!<%= yeoman.app %>/scripts/angular-fullscreen.js',

		'!<%= yeoman.app %>/scripts/services/diagram.js',
		'!<%= yeoman.app %>/scripts/directives-custom.js',
		'!<%= yeoman.app %>/scripts/directives/diagram.js',
		'!<%= yeoman.app %>/scripts/controllers/diagram.js'
	]
};