module.exports = {
	html: ["<%= yeoman.dist %>/**/*.html", "!<%= yeoman.dist %>/bower_components/**"],
	css: ["<%= yeoman.dist %>/styles/**/*.css"],
	options: {
		dirs: ["<%= yeoman.dist %>"]
	}
};