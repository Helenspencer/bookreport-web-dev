(function() {
  'use strict';
  angular.module('app').controller('OrganizationUserCtrl', OrganizationUserCtrl);

  OrganizationUserCtrl.$inject = [
  '$scope', '$location', '$stateParams', 'OrganizationsSvc', 'dialogs', '$modal', 'UsersSvc', 'AppConfig'
  ];

  function OrganizationUserCtrl($scope, $location, $stateParams, OrganizationsSvc, dialogs, $modal, UsersSvc, AppConfig) {
    var vm = this; 
    vm.save = save;
    vm.cancel = cancel;

    var params = $stateParams;

    vm.permissions = AppConfig.permissions;
    vm.organizationId = params.id;
    vm.userId=params.userId;
    vm.addNewEmail=addNewEmail;
    vm.closeAlert = closeAlert;
    vm.removeEmail = removeEmail;
    vm.EmailAlert = [];

    loadUser();

    function loadUser(){
      UsersSvc.get(params.userId, vm.organizationId).then(function(resp) {
        vm.user = resp;
        vm.isRemove = vm.user.Email.length>1 ? true: false;
      });
    }    

    function removeEmail(index) {
      vm.user.Email.splice(index, 1);
      vm.save(true);
    }

    function addNewEmail() {
      var isNewEmail = _.find(vm.user.Email,function(email){return email === vm.user.NewEmail;});
      if(!isNewEmail){
        vm.save(true);
      }else{
        vm.EmailAlert = [{'msg': 'The user alreday exists with this email id', 'type':'danger'}];
      }
    }

    function closeAlert(index){
      vm.EmailAlert.splice(index, 1);
    }

    function cancel(){

      if($location.path() == '/app/settings/users/'+params.userId) {
        $location.path('/app/settings');
      } else{
        $location.path('/app/organizations/'+vm.organizationId);
      }
    }

    function save(stayOnPage) {
      vm.saving = true;
      vm.EmailAlert=[];
      UsersSvc.save(vm.user, vm.organizationId).then(function() {
        vm.saving = false;
        if(!stayOnPage){
          if($location.path() == '/app/settings/users/'+vm.userId) {
            $location.path('/app/settings');
          } else{
            $location.path('/app/organizations/'+vm.organizationId);
          } 
        } else{
          loadUser();
        }          
      }, function(error){          
       $scope.loadingUser = false;
       if(error.data && error.data.errorCode && error.data.errorCode === 600){
        vm.EmailAlert.push({'msg': 'Input email is associated with another user in the system. Please use a different email.', 'type':'danger'});    
      }
    });
    }
  }
}).call(this);