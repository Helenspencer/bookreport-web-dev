(function() {
	'use strict';
	angular.module('documentApp').controller('DocumentPusherCtrl', DocumentPusherCtrl);

	DocumentPusherCtrl.$inject = ['vm', '$log', '$rootScope'];

	function DocumentPusherCtrl(vm, $log, $rootScope) {		
		
		$rootScope.$on('document_changed', function() {					
			vm.initializeDocument();
		});
	}
}).call(this);