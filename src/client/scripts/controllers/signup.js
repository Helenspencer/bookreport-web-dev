(function() {
	'use strict';
	angular.module('app').
	controller('SignUpCtrl', SignUpCtrl);

	SignUpCtrl.$inject = ['$scope', '$rootScope', 'SessionService', '$location'];

	function SignUpCtrl($scope, $rootScope, SessionService, $location) {
		var vm = this;

		$rootScope.isLoginPage = false;
		$rootScope.isPublicPage = true;
		$rootScope.isMainPage = false;
		vm.signup = signup;
		vm.closeAlert = closeAlert;

		var loginHandler, errorHandler;

		function signup() {
			return SessionService.signup({'email':vm.email}, loginHandler, errorHandler);
		}

		loginHandler = function () {
			if (SessionService.isAuthorized()) {
				$scope.$emit('getUser');
				var requestedPath = $rootScope.returnToState;
				var requestedPathId = $rootScope.returnToStateParams;
				if (requestedPath && requestedPathId) {
					requestedPath += requestedPathId;
				}

				if (requestedPath) {
					$location.path('/app' + requestedPath);
				} else {
					$location.path('/app/dashboard');
				}
			} else {
				vm.alerts = [];
				vm.alerts.push({
					'msg': 'Error! Unknown error occured, please try again.',
					'type': 'danger'
				});								
			}
		};

		errorHandler = function(data) {			
			vm.alerts = [];
			vm.alerts.push({
				'msg': 'Error! Unknown error occured, please try again.',
				'type': 'danger'
			});
			if(data.error){
				if(data.errorCode === 600){
					vm.alerts[0].msg = 'Error! Signups are restricted. Please contact admin.';
				} else{
					vm.alerts[0].msg = data.msg;
				}				
			}
		};

		function closeAlert(index){
			vm.alerts.splice(index,1);
		}
	}

}).call(this);