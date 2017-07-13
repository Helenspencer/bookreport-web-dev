(function() {
	'use strict';
	angular.module('documentApp').controller('PusherDocEventHandler', PusherDocEventHandler);

	PusherDocEventHandler.$inject = ['vm', 'PusherService', 'PusherChannels', 'PusherEvents', '$log', '$rootScope', '$timeout', 'ENV'];

	function PusherDocEventHandler(vm, PusherService, PusherChannels, PusherEvents, $log, $rootScope, $timeout, ENV) {		

		$rootScope.$on('documentLoaded', function() {			
			subscribeToPusherEvents();		
		});		

		function subscribeToPusherEvents(){
			PusherService.subscribeAndBind(getChannelName(), 'doc_event', function(msg) {
				$rootScope.$broadcast(msg.Name);
				$log.debug(msg);
			});	
		}		

		function getChannelName(){
			return PusherChannels.CEDARWOOD+'_DOCUMENT_'+vm.fileId;
		}
		
	}
}).call(this);