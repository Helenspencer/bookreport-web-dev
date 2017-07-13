module.exports = {
	compass: {
		files: ["<%= yeoman.app %>/styles/**/*.{scss,sass}"],
		tasks: ["compass:server"]
	},
	js: {
		files: ['<%= yeoman.app %>/scripts/**/*.js'],
		tasks: ['newer:jshint:all'],
		options: {
			livereload: true
		}
	},
	less: {
		files: ["<%= yeoman.app %>/styles-less/**/*.less"],
		tasks: ["less:server"]
	},
	livereload: {
		options: {
			livereload: "<%= yeoman.lrp %>"
		},
		files: [
			"<%= yeoman.app %>/index.html",
			"<%= yeoman.app %>/views/**/*.html",
			"<%= yeoman.app %>/styles/**/*.scss",
			"<%= yeoman.app %>/styles-less/**/*.less",
			"<%= yeoman.app %>/scripts/**/*.js",
			".tmp/styles/**/*.css",
			"{.tmp,<%= yeoman.app %>/scripts/**/*.js",
			"<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}"
		]
	}
};