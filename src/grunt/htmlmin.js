module.exports = {
	dist: {
		options: {},
		files: [{
			expand: true,
			cwd: "<%= yeoman.app %>",
			src: ["*.html", "views/*.html"],
			dest: "<%= yeoman.dist %>"
		}]
	}
};