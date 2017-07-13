'use strict';
angular.module('app').controller('ResetPasswordCtrl', ResetPasswordCtrl);

ResetPasswordCtrl.$inject = [
  '$scope', 'UsersSvc', '$rootScope'
];

function ResetPasswordCtrl($scope, UsersSvc, $rootScope) {
  var vm = this;

  $rootScope.isLoginPage = false;
  $rootScope.isPublicPage = true;
  $rootScope.isMainPage = false;

  vm.data = {
    'Email': ''
  };

  vm.confirmation = false;
  vm.resetPassword = resetPassword;
  vm.closeAlert = closeAlert;

  function resetPassword() {
    UsersSvc.resetPassword(vm.data).then(function() {
      vm.confirmation = true;
    }, function() {      
      vm.alerts = [];
      vm.alerts.push({
        'msg': 'Invalid email.',
        'type': 'danger'
      });
    });
  }

  function closeAlert(index) {
    return vm.alerts.splice(index, 1);
  }
}