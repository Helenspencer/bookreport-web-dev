module.exports = {
	html: "<%= yeoman.app %>/index.html",
	options: {
		dest: "<%= yeoman.dist %>",
		flow: {
			steps: {
				js: ["concat"],
				css: ["cssmin"]
			},
			post: []
		}
	}
};