(function() {
	'use strict';
	angular.module('app').controller('ProjectsPusherCtrl', ProjectsPusherCtrl);

	ProjectsPusherCtrl.$inject = ['vm', '$log', '$rootScope', '$timeout', 'ENV'];

	function ProjectsPusherCtrl(vm, $log, $rootScope, $timeout, ENV) {		

		var fileEventProcessDelay = parseInt(ENV.fileEventProcessDelay)*1000;

		$rootScope.$on('file_added', function() {
			$timeout(function(){
					$log.info("calling search...");
					vm.loadOrgTags();
					vm.searchLibrary(true);
				}, fileEventProcessDelay);
		});

		$rootScope.$on('file_updated', function() {
			$timeout(function(){
					$log.info("calling search...");
					vm.loadOrgTags();
					vm.searchLibrary(true);
				}, fileEventProcessDelay);
		});

		$rootScope.$on('file_archived', function() {
			$timeout(function(){
					$log.info("calling search...");
					vm.searchLibrary(true);
				}, fileEventProcessDelay);
		});

		$rootScope.$on('file_downloaded', function() {
			$timeout(function(){
					$log.info("calling search...");
					vm.searchLibrary(true);
					// vm.loadProjects();
				}, fileEventProcessDelay);
		});		
	}
}).call(this);