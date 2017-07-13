module.exports = {
	server: {
		options: {
			strictMath: true,
			dumpLineNumbers: true,
			sourceMap: true,
			sourceMapRootpath: "",
			outputSourceFiles: true
		},
		files: [{
			expand: true,
			cwd: "<%= yeoman.app %>/styles",
			src: "main.less",
			dest: ".tmp/styles",
			ext: ".css"
		}]
	},
	dist: {
		options: {
			cleancss: true,
			report: 'min'
		},
		files: [{
			expand: true,
			cwd: "<%= yeoman.app %>/styles",
			src: "main.less",
			dest: ".tmp/styles",
			ext: ".css"
		}]
	}
};