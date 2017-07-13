(function() {
  'use strict';
  angular.module('app').controller('ProposalsCtrl', ProposalsCtrl);

  ProposalsCtrl.$inject = [
    '$scope', '$location', '$stateParams', 'ProposalsSvc', 'dialogs', '$modal', '$rootScope', 'SessionService', '$window', 'OrganizationsSvc'
  ];

  function ProposalsCtrl($scope, $location, $stateParams, ProposalsSvc, dialogs, $modal, $rootScope, SessionService, $window, OrganizationsSvc) {
    var original, vm = this;

    vm.getProposals = getProposals;
    vm.canRevert = canRevert;
    vm.canSubmit = canSubmit;
    vm.isCreate = isCreate;
    vm.updateProposal = updateProposal;
    vm.save = save;
    vm.edit = edit;
    vm.removeProposal = removeProposal;
    vm.openDate = openDate;

    vm.dateOptions = {
      'year-format': 'yy',
      'starting-day': 1,
      'startDateOpened': false,
      'endDateOpened': false
    };

    vm.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'shortDate'];
    vm.format = vm.formats[0];

    getProposals();

    function openDate($event, field) {
      $event.preventDefault();
      $event.stopPropagation();

      vm.dateOptions[field] = true;
    }

    function loadProposals() {
      var proposalId = $stateParams.id;

      if (proposalId) {
        if (proposalId !== 'new') {
          ProposalsSvc.get(proposalId).then(function(resp) {
            vm.proposal = resp;
            var decision = $stateParams.decision;
            if (decision === 'accept') {
              vm.proposal.Accepted = true;
            } else if (decision === 'reject') {
              vm.proposal.Rejected = true;
            }
          });
        } else {
          vm.proposal = {
            'StartDate': new Date(),
            'EndDate': moment().add(1, 'months').toDate()
          };
        }
      } else {
        ProposalsSvc.list().then(function(resp) {
          vm.proposals = resp;
        });
      }
    }

    function getProposals() {
      vm.user = $rootScope.user;      
      if (!$rootScope.user) {
        SessionService.getUser().then(function(resp) {
          vm.user = resp;          
          loadProposals();
        });
      } else {
        loadProposals();
      }
    }

    original = angular.copy(vm.proposal);

    function canRevert() {
      return !angular.equals(vm.proposal, original) || !vm.proposalForm.$pristine;
    }

    function canSubmit() {
      return vm.proposalForm && vm.proposalForm.$valid && !angular.equals(vm.proposal, original);
    }

    function isCreate() {
      if (vm.proposal.EntityID) {
        return false;
      } else {
        return true;
      }
    }

    function updateProposal(proposal) {
      ProposalsSvc.update(proposal).then(function() {
        return getProposals();
      });
    }

    function save() {
      vm.saving = true;
      var proposal = angular.copy(vm.proposal);

      if(proposal.StartDate){
          proposal.StartDate = moment(proposal.StartDate).format('MM-DD-YYYY');
      }

      ProposalsSvc.save(proposal).then(function() {
        vm.saving = false;
        if (vm.proposal.SelectedOrganization) {
          changeOrganization(vm.proposal.SelectedOrganization);
        } else if (vm.proposal.EntityID && vm.proposal.NewOrganizationName) {
          OrganizationsSvc.list().then(function(resp) {
            resp.forEach(function(item){
              if(item.Name === vm.proposal.NewOrganizationName){
                changeOrganization(item.EntityID);
              }
            });
          });
        } else {
          $location.path('/app/engagements');
        }
      });
    }

    function changeOrganization(organizationId) {
      $rootScope.user.LastViewedOrganizationID = organizationId;
      SessionService.updateProfile($rootScope.user).then(function() {
        $window.location.reload();
        $location.path('/app/engagements');
      });
    }

    function edit(proposal) {
      return $location.path('/app/proposals/' + proposal.EntityID);
    }

    function removeProposal() {
      var dlg;
      dlg = dialogs.confirm('Remove "' + vm.proposal.Name + '"?', '');
      dlg.result.then(function() {
        ProposalsSvc.remove(vm.proposal.EntityID).then(function() {
          $location.path('/app/engagements');
        });
      });
    }

    $scope.$watch(function() {
      if (vm.proposal) {
        return vm.proposal.Organization;
      }
    }, function() {
      if (vm.proposal) {
        if (vm.proposal.Organization === 'existing') {
          vm.proposal.ShowOrganizations = true;
          vm.organizations = [];
          $rootScope.organizations.forEach(function(item){
            if(!item.IsPersonal){
              vm.organizations.push(item);
            }
          });
        } else {
          vm.proposal.ShowOrganizations = false;
          vm.proposal.NewOrganizationName = vm.proposal.OrganizationName || 'default Organization';
        }
      }
    });
  }
}).call(this);