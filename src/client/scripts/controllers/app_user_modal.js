(function() {
  'use strict';
  angular.module('app').controller('AppUserModalCtrl', AppUserModalCtrl);

  AppUserModalCtrl.$inject = ['$scope', '$modalInstance', 'AppUsersSvc'];


  function AppUserModalCtrl($scope, $modalInstance, AppUsersSvc) {

    $scope.cancel = function() {
      $modalInstance.dismiss();
    };

    $scope.createUser = function() {
      $scope.saving = true;
      AppUsersSvc.save($scope.data).then(function() {
        $scope.saving = false;
        $modalInstance.close();        
      }, function error(resp){
        if(resp.data && resp.data.errorCode && resp.data.errorCode ===600){
          $scope.userAlerts=[{'msg': 'User with email '+$scope.data.Email+' is already existed!', 'type':'danger'}];
        }
      });
    };

    $scope.closeAlert = function(index){
      $scope.userAlerts.splice(index, 1); 
    };
  }
})();