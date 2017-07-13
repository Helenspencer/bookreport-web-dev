(function() {
	'use strict';
	angular.module('app').controller('LibraryPusherCtrl', LibraryPusherCtrl);

	LibraryPusherCtrl.$inject = ['vm', '$log', '$rootScope', '$timeout', 'ENV'];

	function LibraryPusherCtrl(vm, $log, $rootScope, $timeout, ENV) {		

		var fileEventProcessDelay = parseInt(ENV.fileEventProcessDelay)*1000;

		$rootScope.$on('file_added', function() {
			$timeout(function(){
					$log.info("calling search... file added");
					vm.searchLibrary(true);
				}, fileEventProcessDelay);
		});

		$rootScope.$on('file_archived', function() {
			$timeout(function(){
					$log.info("calling search...");
					vm.searchLibrary(true);
				}, fileEventProcessDelay);
		});		

		$rootScope.$on('file_updated', function() {
			vm.currentTimestamp = new Date().getTime();
			if(vm.currentTimestamp - vm.lastUpdatedSearch <= 60000){
				$timeout(function(){
					$log.info("calling search...file updated");
					vm.searchLibrary(true);
				}, 60000-(vm.currentTimestamp - vm.lastUpdatedSearch));
			}
		});

		$rootScope.$on('file_downloaded', function() {
			$timeout(function(){
				$log.info("calling search...");
				vm.searchLibrary(true);
			}, fileEventProcessDelay);
		});

		$rootScope.$on('tag_updated', function() {
			$timeout(function(){
				$log.info("calling search... tag updated");
				vm.searchLibrary(true);
			}, fileEventProcessDelay);
		});

		$rootScope.$on('tag_removed', function() {
			$log.info("calling search... tag removed ");
			vm.searchLibrary(true);
		});
	}
}).call(this);
