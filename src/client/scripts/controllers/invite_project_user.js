(function() {
  'use strict';
  angular.module('app').controller('InviteProjectCtrl', InviteProjectCtrl);

  InviteProjectCtrl.$inject = [
  '$scope', '$modalInstance', 'project', 'AppConfig', '$rootScope', 'ProjectSvc', 'dialogs'
  ];

  function InviteProjectCtrl($scope, $modalInstance, project, AppConfig, $rootScope, ProjectSvc, dialogs) {
    var vm = this;    
    vm.project = project;
    vm.cancel = cancel;
    vm.invite = invite;
    vm.closeAlert = closeAlert;

    vm.project.ProjectUser = {
      /*'Relation': AppConfig.ProjectPermissions[1].key,*/
      'Message': 'Dear, <p> I\'d like to invite you to my project.<p> Kind regards,<p> ' + ($rootScope.user.EmailSignature?$rootScope.user.EmailSignature:$rootScope.user.DisplayName),      
      'ProjectID': vm.project.EntityID
    };

    function cancel() {
      $modalInstance.dismiss();
    }

    function closeAlert(index){
      vm.duplicateUserAlert.splice(index, 1);
    }

    function invite() {
      vm.duplicateUserAlert = [];
      ProjectSvc.save(vm.project).then(function() {
        $modalInstance.close();
        var dlg;
        dlg = dialogs.notify('Invitation Sent.', 'Your invite has been sent!');
        dlg.result.then(function() {});
      }, function(error){          
        if(error.data && error.data.errorCode && error.data.errorCode === 602 && error.data.msg ==="OrgAdmin"){
          vm.duplicateUserAlert.push({'msg': 'The invited user is Organization Admin and already a member of this project', 'type':'danger'});    
        }else if(error.data && error.data.errorCode && error.data.errorCode === 602 ){
          vm.duplicateUserAlert.push({'msg':'User with input email is already a project member', 'type':"danger"});
        }
      });
    }
  }
}).call(this);