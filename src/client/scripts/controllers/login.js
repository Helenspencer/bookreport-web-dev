'use strict';
angular.module('app').
controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = ['$scope', '$rootScope', '$location', 'SessionService', '$state'];

function LoginCtrl($scope, $rootScope, $location, SessionService, $state) {
	var vm = this;

	$rootScope.isLoginPage = true;
	$rootScope.isLightLoginPage = false;
	$rootScope.isLockscreenPage = false;
	$rootScope.isMainPage = false;

	var errorHandler, loginHandler;
	vm.data = {};
	vm.login = login;
	vm.closeAlert = closeAlert;

	var params = $location.search();	
	vm.data.username = params.email;
	vm.data.password = params.pwd;	

	function closeAlert(index) {
		return vm.alerts.splice(index, 1);
	}

	loginHandler = function() {
		if (SessionService.isAuthorized()) {
			$scope.$emit('getUser');
			console.log('$location.path(): ', $location.path());
			$rootScope.$on('userLoaded', function() {
				if ($rootScope.returnToState) {
					$state.go($rootScope.returnToState, $rootScope.returnToStateParams);
				} else if($rootScope.user && !$rootScope.user.isClient) {
					$location.path('/app/dashboard');
				}else if($rootScope.user && $rootScope.user.isClient){
					$location.path('/app/projects');
				}
			});			
		} else {
			vm.alerts = [];
			vm.alerts.push({
				'msg': 'Invalid username or password!',
				'type': 'danger'
			});
		}
	};

	errorHandler = function() {
		vm.alerts = [];
		vm.alerts.push({
			'msg': 'Invalid username or password!',
			'type': 'danger'
		});
	};

	if(vm.data.username && vm.data.password){
		login();
	}

	function login() {
		return SessionService.login(vm.data, loginHandler, errorHandler);
	}

}