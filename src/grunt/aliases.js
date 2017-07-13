module.exports = function(grunt) {
	var target = grunt.option('target') || 'apiary';

	return {
		'docs': [
			'connect:docs', 'open', 'watch'
		],

		'server': ['serve'],
		'serve': ['clean:server', 'copy:vendor','ngconstant:'+target, 'concurrent:server', /*'configureProxies:server',*/ 'connect:livereload', 'open', 'watch'],
		'build': ['clean:dist', 'copy:vendor', 'useminPrepare','useminPrepareDoc', 'concurrent:dist', 'copy:dist', 'cssmin', 'concat', 'uglify', 'usemin'],
		'default': ['server'],
		'deploy': ['build', 'ftp-deploy:'+target]
	};
};