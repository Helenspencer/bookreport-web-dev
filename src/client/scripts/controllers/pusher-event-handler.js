(function() {
	'use strict';
	angular.module('app').controller('PusherEventHandler', PusherEventHandler);

	PusherEventHandler.$inject = ['PusherService', 'PusherChannels', 'PusherEvents', '$log', '$rootScope', '$timeout', 'ENV'];

	function PusherEventHandler(PusherService, PusherChannels, PusherEvents, $log, $rootScope, $timeout, ENV) {		

		$rootScope.$on('userLoaded', function() {
			subscribeToPusherEvents();
		});

		if($rootScope.user){
			subscribeToPusherEvents();
		}

		$rootScope.$on('logout', function(){
			console.log("Unsubscribing from pusher channel...");
			PusherService.unsubscribe(getChannelName());
		});

		var fileEventProcessDelay = parseInt(ENV.fileEventProcessDelay)*1000;

		function subscribeToPusherEvents(){
			PusherService.subscribeAndBind(getChannelName(), PusherEvents.ORGANIZATION_EVENT, function(msg) {
				$rootScope.$broadcast(msg.Name);
				$log.debug(msg);
				$rootScope.data.organizationEvents.push(msg);
				$rootScope.data.unReadCount += 1;
				if(msg.Name === 'file_added'){
					if(!$rootScope.fileUploadPusherEvents){
						$rootScope.fileUploadPusherEvents = [];
					}
					$rootScope.fileUploadPusherEvents.push(msg);
					$rootScope.calculateFilesProgress();
				}
			});	
		}		

		function getChannelName(){
			return PusherChannels.CEDARWOOD+'_'+$rootScope.user.CurrentOrganization.OrganizationID;
		}
		
	}
}).call(this);