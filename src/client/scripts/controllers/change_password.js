'use strict';
angular.module('app').controller('ChangePasswordCtrl', [
  '$scope', '$modalInstance', '$cookies', '$cookieStore', 'UsersSvc', 'profile',
  function($scope, $modalInstance, $cookies, $cookieStore, UsersSvc, profile) {
    $scope.user = profile;    
    $scope.data = {
      'UserAccountID': profile.UserAccountID
    };
    $scope.ok = function() {
      if ($scope.data.ConfirmPassword === $scope.data.NewPassword) {
        UsersSvc.changePassword($scope.data).then(function() {
          $modalInstance.close();
        });
      } else {
        $scope.chgPwdAlerts = [{
          type: 'danger',
          msg: 'form.change_password.error_messages.password_mismatch_msg'
        }];
      }
    };
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  }
  ]);