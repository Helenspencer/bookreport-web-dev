(function() {
  'use strict';
  angular.module('app').controller('OrganizationsCtrl', OrganizationsCtrl);

  OrganizationsCtrl.$inject = [
  '$scope', '$location', '$stateParams', 'OrganizationsSvc', 'dialogs', '$modal', '$rootScope', 'SessionService'
  ];

  function OrganizationsCtrl($scope, $location, $stateParams, OrganizationsSvc, dialogs, $modal, $rootScope, SessionService) {
    var original, vm = this;

    vm.getOrganizations = getOrganizations;
    vm.canRevert = canRevert;
    vm.canSubmit = canSubmit;
    vm.isCreate = isCreate;
    vm.updateOrganization = updateOrganization;
    vm.save = save;
    vm.edit = edit;
    vm.editUser = editUser;
    vm.showUserInvitationModal = showUserInvitationModal;
    vm.removeUser = removeUser;
    vm.removeOrganization = removeOrganization;

    $location.search('settings', undefined);
    
    getOrganizations();
    function loadOrganization(organizationId) {
      var user = $rootScope.user;
      OrganizationsSvc.get(organizationId).then(function(resp) {
        vm.organization = resp;

        var users = resp.Users;

        if (users) {
          users.forEach(function(item) {
            if (item.EntityID === user.UserAccountID) {
              vm.organization['is' + item.Permission.replace(' ', '')] = true;
            }
          });
        }

      });
    }

    function loadOrganizations(user) {
      var organizationId = $stateParams.id;

      if (organizationId) {
        if (organizationId !== 'new') {
          loadOrganization(organizationId);
        } else {
          vm.organization = {};
        }
      } else {
        if ($location.path() === '/app/settings') {
          vm.settingsPage = true;
          loadOrganization(user.CurrentOrganization.OrganizationID);
        } else {
          OrganizationsSvc.list().then(function(resp) {
            vm.organizations = resp;
            $rootScope.organizations = resp;
          });
        }
      }
    }

    function getOrganizations() {
      var user = $rootScope.user;
      if (!$rootScope.user) {
        SessionService.getUser().then(function(resp) {
          user = resp;
          loadOrganizations(user);
        });
      } else {
        loadOrganizations(user);
      }
    }

    original = angular.copy(vm.organization);

    function canRevert() {
      return !angular.equals(vm.organization, original) || !vm.organizationForm.$pristine;
    }

    function canSubmit() {
      return vm.organizationForm && vm.organizationForm.$valid && !angular.equals(vm.organization, original);
    }

    function isCreate() {
      if (vm.organization.EntityID) {
        return false;
      } else {
        return true;
      }
    }

    function updateOrganization(organization) {
      OrganizationsSvc.update(organization).then(function() {
        return getOrganizations();
      });
    }

    function save() {
      vm.saving = true;
      OrganizationsSvc.save(vm.organization).then(function() {
        vm.saving = false;
        if (isCreate()) {
          return $location.path('/app/organizations');
        } else {
          $location.path('/app/organizations');
        }
      });
    }

    function edit(organization) {
      
      return $location.path('/app/organizations/' + organization.EntityID);
    }
    
    function editUser(organization, userId) {

      if($location.path() == '/app/organizations/' + organization){
        
        $location.path('/app/organizations/' + organization+'/users/'+userId).search('settings', vm.settingsPage?'true':'false');
      
      }else if($location.path() == '/app/settings'){

        vm.settingsPage = true;
        $location.path('app/settings/users/'+userId);
      
      }
    }

    function showUserInvitationModal() {
      var modalInstance;
      modalInstance = $modal.open({
        templateUrl: 'views/organizations/user-invitation.html',
        controller: 'InviteUserCtrl as modal',
        size: 'lg',
        resolve: {
          organization: function() {
            return vm.selectedOrganization ? vm.selectedOrganization : vm.organization;
          }
        }
      });
      modalInstance.result.then(function() {
        getOrganizations();
      });
    }

    function removeUser() {      
      var dlg;
      dlg = dialogs.confirm('Remove "' + vm.organizationUser.DisplayName + '" from "' + vm.organization.Name + '"?', '');
      dlg.result.then(function() {
        OrganizationsSvc.removeUser({
          'OrganizationID': vm.organization.EntityID,
          'UserAccountID': vm.organizationUser.EntityID,
          'Role': vm.organizationUser.Permission
        }).then(function() {
          getOrganizations();
          vm.organizationUser = undefined;
        });
      });
    }

    function removeOrganization() {
      var dlg;
      dlg = dialogs.confirm('Remove "' + vm.organization.Name + '"?', '');
      dlg.result.then(function() {
        OrganizationsSvc.remove(vm.organization.EntityID).then(function() {
          $location.path('/app/organizations');
        });
      });
    }

    function populateOrganizationPermissions() {
      var user = $rootScope.user;
      OrganizationsSvc.get(vm.selectedOrganization.EntityID).then(function(resp) {
        var users = resp.Users;

        if (users) {
          users.forEach(function(item) {
            if (item.EntityID === user.UserAccountID) {
              vm.selectedOrganization['is' + item.Permission.replace(' ', '')] = true;
            }
          });
        }
      });
    }

    $scope.$watch(function() {
      return vm.selectedOrganization;
    }, function(nv) {
      if (nv) {
        populateOrganizationPermissions();
      }
    });
  }
}).call(this);