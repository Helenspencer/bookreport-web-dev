'use strict';
angular.module('app').controller('UsersCtrl', [
  '$scope', '$location', '$stateParams', 'UsersSvc', 'dialogs',
  function($scope, $location, $stateParams, UsersSvc, dialogs) {
    var original;
    $scope.getUsers = function() {
      var params;
      params = $stateParams;
      if (!params.id) {
        UsersSvc.list().then(function(resp) {
          $scope.users = resp;
        });
      } else if (params.id !== 'new') {
        UsersSvc.get(params.id).then(function(resp) {
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
    $scope.save = function() {
      $scope.saving = true;
      UsersSvc.save($scope.user).then(function() {
        $scope.saving = false;
        if ($scope.isCreate()) {
          $location.path('/app/users');
        } else {
          UsersSvc.get($scope.user.EntityID).then(function(resp) {
            $scope.user = resp;
            $location.path('/app/users');
          });
        }
      });
    };
    $scope.removeUser = function() {
      var dlg;
      dlg = dialogs.confirm('Remove "' + $scope.user.FullName + '" User?', '');
      dlg.result.then(function() {
        UsersSvc.remove($scope.user.EntityID).then(function() {
          $location.path('/app/users');
        });
      });
    };
    $scope.edit = function(user) {
      $location.path('/app/users/' + user.EntityID);
    };
  }

  
]);