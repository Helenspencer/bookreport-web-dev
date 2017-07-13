'use strict';
angular.module('app').controller('ProfileCtrl', [
  '$scope', '$modalInstance', '$cookies', '$cookieStore', 'profile', 'isDataCapture','$rootScope', 'SessionService',
  function($scope, $modalInstance, $cookies, $cookieStore, profile, isDataCapture, $rootScope, SessionService) {

    $scope.user = angular.copy(profile);
    $scope.user.OrganizationName = $scope.user.CurrentOrganization.Name;
    $scope.isDataCapture=isDataCapture;
    $scope.isRemove = $scope.user.Email.length>1 ? true: false;
    $scope.EmailAlert = [];

    $scope.ok = function() {
      $modalInstance.close($scope.user);
    };
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.addNewEmail = function () {
      $scope.loadingUser = true;
      $scope.EmailAlert=[];
      var isNewEmail = _.find($scope.user.Email,function(email){return email===$scope.user.NewEmail;});
      if(!isNewEmail){
        SessionService.updateProfile($scope.user).then(function() {
          $rootScope.$broadcast('getUser');
        }, function(error){          
           $scope.loadingUser = false;
           if(error.data && error.data.errorCode && error.data.errorCode === 600){
            $scope.EmailAlert.push({'msg': 'Input email is associated with another user in the system. Please use a different email.', 'type':'danger'});    
           }
           console.log($scope.EmailAlert);
        });        
      }else{
        $scope.EmailAlert = [{'msg': 'The user alreday exists with this email id', 'type':'danger'}];
      }
    };

    $rootScope.$on('userLoaded', function(){
      $scope.loadingUser = false;
      $scope.user = $rootScope.user;
      $scope.isRemove = $scope.user.Email.length>1 ? true: false;
    });

    $scope.closeAlert = function (index) {
      $scope.EmailAlert.splice(index, 1);
    };

    $scope.removeEmail = function (index) {
      $scope.user.Email.splice(index, 1);
      SessionService.updateProfile($scope.user).then(function() {
        $rootScope.$broadcast('getUser');
      });      
    };    

    $scope.isPersonalDetailsCaptured = function(){
      //If atleast one organization data is updated, it is assumed that user
      //first name, last name are updated.
      var value = false;
      if($scope.user.CapturedUserDataOnLogin){
        value = Object.keys($scope.user.CapturedUserDataOnLogin).length>0;
      }

      return value;
    };
  }
  ]);