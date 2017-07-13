'use strict';
angular.module('app').controller('AppUsersCtrl', [
  '$scope', '$location', '$stateParams', 'AppUsersSvc', 'dialogs', '$modal',
  function($scope, $location, $stateParams, AppUsersSvc, dialogs, $modal) {
    var original;
    $scope.getUsers = function() {
      var params;
      params = $stateParams;
      if (!params.id) {
        AppUsersSvc.list().then(function(resp) {
          $scope.users = resp;
        });
      } else if (params.id !== 'new') {
        AppUsersSvc.get(params.id).then(function(resp) {
          $scope.user = resp;
        });
      } else if (params.id === 'new') {
        $scope.user = {};
      }
    };
    $scope.getUsers();
    original = angular.copy($scope.user);
    $scope.canRevert = function() {
      return !angular.equals($scope.user, original) || !$scope.userForm.$pristine;
    };
    $scope.canSubmit = function() {
      return $scope.userForm && $scope.userForm.$valid && !angular.equals($scope.user, original);
    };
    $scope.isCreate = function() {
      if ($scope.user.EntityID) {
        return false;
      } else {
        return true;
      }
    };   
    $scope.removeUser = function(user) {
      AppUsersSvc.remove(user.EntityID).then(function() {
        $scope.getUsers();
      });
    };

    $scope.showAddUserModal = function() {
      var modalInstance;
      modalInstance = $modal.open({
        templateUrl: 'views/app-users/user.html',
        controller: 'AppUserModalCtrl as modal'
      });
      modalInstance.result.then(function() {
        $scope.getUsers();
      });
    };
  }
  ]);