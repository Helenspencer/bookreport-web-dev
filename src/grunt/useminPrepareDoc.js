module.exports = {
	html: "<%= yeoman.app %>/document-view.html",
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