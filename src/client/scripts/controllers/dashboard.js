(function() {
  'use strict';
  angular.module('app').controller('DashboardCtrl', [
    '$scope', '$location', 'SessionService', function($scope, $location, SessionService) {    	
      if (SessionService.isAuthorized()) {

      } else {
        return $location.path('/login');
      }
    }
  ]);

}).call(this);
