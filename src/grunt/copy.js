module.exports = {
	vendor: {
		files: [{
			expand: true,
			dot: true,
			cwd: "<%= yeoman.app %>/scripts/vendors",
			dest: "<%= yeoman.app %>/bower_components/pdf.js-viewer",
			src: ["pdf.worker.js"]
		}]
	}
	,
	dist: {
		files: [{
			expand: true,
			dot: true,
			cwd: "<%= yeoman.app %>",
			dest: "<%= yeoman.dist %>",
			src: ["bower_components/pdf.js-viewer/**/*", "favicon.ico", "*.png", "bower_components/bootstrap/dist/css/*", "bower_components/textAngular/dist/*.css","bower_components/jquery-ui/themes/smoothness/**/*","bower_components/font-awesome/css/*", "bower_components/font-awesome/fonts/*", "bower_components/weather-icons/css/*", "bower_components/weather-icons/fonts/*", "bower_components/weather-icons/font/*", "fonts/**/*", "i18n/**/*", "images/**/*", "styles/fonts/**/*", "styles/img/**/*", "styles/ui/images/*", "views/**/*", "scripts/vendors/**/*.*", "locales/**/*","locale/**/*", "bower_components/angular/angular.min.js"/*Is needed for webworkers*/]
		}, {
			expand: true,
			cwd: ".tmp",
			dest: "<%= yeoman.dist %>",
			src: ["styles/**/{,*/}*.{css,woff,woff2,ttf,png}","styles-less/**", "assets/**"]
		}, {
			expand: true,
			cwd: ".tmp/images",
			dest: "<%= yeoman.dist %>/images",
			src: ["generated/*"]
		}, {
            expand: true,
            flatten: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>/scripts',
            src: ['scripts/config*.js','scripts/initExcelbook.js']
        }]
	},
	styles: {
		expand: true,
		cwd: "<%= yeoman.app %>/styles",
		dest: ".tmp/styles/",
		src: "**/{,*/}*.{css,woff,woff2,ttf,png}"
	}
};
