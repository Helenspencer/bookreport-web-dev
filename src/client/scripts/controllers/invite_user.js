(function() {
  'use strict';
  angular.module('app').controller('InviteUserCtrl', InviteUserCtrl);

  InviteUserCtrl.$inject = [
    '$scope', '$modalInstance', 'organization', 'AppConfig', '$rootScope', 'OrganizationsSvc', 'dialogs'
  ];


  function InviteUserCtrl($scope, $modalInstance, organization, AppConfig, $rootScope, OrganizationsSvc, dialogs) {
    var vm = this;
    vm.organization = organization;
    vm.cancel = cancel;
    vm.invite = invite;

    if (vm.organization.isOrganizationAdmin) {
      vm.permissions = AppConfig.permissions;
    } else if (vm.organization.isManager) {
      vm.permissions = AppConfig.permissions.slice(1);
    }else if (vm.organization.isAssociate) {
      vm.permissions = AppConfig.permissions.slice(2);
    }else if (vm.organization.isAnalyst) {
      vm.permissions = AppConfig.permissions.slice(3);
    }


    vm.userInvitation = {
      'Permission': vm.permissions[0].key,
      'Message': '<p>Dear, <p>I\'d like to invite you to my organization. <p>Kind regards,<p> ' + ($rootScope.user.EmailSignature?$rootScope.user.EmailSignature: $rootScope.user.DisplayName),
      'UserAccountID': $rootScope.user.UserAccountID,
      'OrganizationID': vm.organization.EntityID
    };

    function cancel() {
      $modalInstance.dismiss();
    }

    function invite() {
      vm.invitationAlerts=[];
      OrganizationsSvc.inviteUser(vm.userInvitation).then(function() {
        $modalInstance.close();
        var dlg;
        dlg = dialogs.notify('Invitation Sent.', 'Your invite has been sent!');
        dlg.result.then(function() {});
      }, function error(resp){
        if(resp.data && resp.data.errorCode && resp.data.errorCode ===600){
          vm.invitationAlerts=[{'msg': 'User with email '+vm.userInvitation.Email+' is already associated with this organization!', 'type':'danger'}];
        }
      });
    }
  }
}).call(this);