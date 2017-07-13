(function() {
  'use strict';
  angular.module('app').controller('EngagementsCtrl', EngagementsCtrl);

  EngagementsCtrl.$inject = [
    '$scope', '$location', '$stateParams', 'EngagementsSvc', 'dialogs', '$modal', '$rootScope', 'SessionService'
  ];

  function EngagementsCtrl($scope, $location, $stateParams, EngagementsSvc, dialogs, $modal, $rootScope, SessionService) {
    var original, vm = this;

    vm.getEngagements = getEngagements;
    vm.canRevert = canRevert;
    vm.canSubmit = canSubmit;
    vm.isCreate = isCreate;
    vm.updateEngagement = updateEngagement;
    vm.save = save;
    vm.edit = edit;
    vm.removeEngagement = removeEngagement;
    vm.openDate = openDate;
    vm.showAddProjectModal = showAddProjectModal;

    vm.dateOptions = {
      'year-format': 'yy',
      'starting-day': 1,
      'startDateOpened': false,
      'endDateOpened': false
    };

    vm.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'shortDate'];
    vm.format = vm.formats[0];

    getEngagements();

    function openDate($event, field) {
      $event.preventDefault();
      $event.stopPropagation();

      vm.dateOptions[field] = true;
    }

    function loadEngagements() {
      var engagementId = $stateParams.id;

      if (engagementId) {
        if (engagementId !== 'new') {
          EngagementsSvc.get(engagementId).then(function(resp) {
            vm.engagement = resp;
          });
        } else {
          vm.engagement = {
            'StartDate': new Date(),
            'EndDate': moment().add(1, 'months').toDate()
          };
        }
      } else {
        EngagementsSvc.list().then(function(resp) {
          vm.engagements = resp;
          $rootScope.engagements = resp;
        });
      }
    }

    function getEngagements() {
      vm.user = $rootScope.user;
      
      if (!$rootScope.user) {
        SessionService.getUser().then(function(resp) {
          vm.user = resp;
          loadEngagements();
        });
      } else {
        loadEngagements();
      }
    }

    original = angular.copy(vm.engagement);

    function canRevert() {
      return !angular.equals(vm.engagement, original) || !vm.engagementForm.$pristine;
    }

    function canSubmit() {
      return vm.engagementForm && vm.engagementForm.$valid && !angular.equals(vm.engagement, original);
    }

    function isCreate() {
      if (vm.engagement.EntityID) {
        return false;
      } else {
        return true;
      }
    }

    function updateEngagement(engagement) {
      EngagementsSvc.update(engagement).then(function() {
        return getEngagements();
      });
    }

    function save() {
      vm.saving = true;
      EngagementsSvc.save(vm.engagement).then(function() {
        vm.saving = false;
        if (isCreate()) {
          return $location.path('/app/engagements');
        } else {
          $location.path('/app/engagements');
        }
      });
    }

    function edit(engagement) {
      return $location.path('/app/engagements/' + engagement.EntityID);
    }

    function removeEngagement() {
      var dlg;
      dlg = dialogs.confirm('Remove "' + vm.engagement.Name + '"?', '');
      dlg.result.then(function() {
        EngagementsSvc.remove(vm.engagement.EntityID).then(function() {
          $location.path('/app/engagements');
        });
      });
    }

    function showAddProjectModal(engagement) {
      if (engagement) {
        vm.selectedEngagement = engagement;
      }
      var modalInstance;
      modalInstance = $modal.open({
        templateUrl: 'views/engagements/project.html',
        controller: 'ProjectCtrl as modal',
        resolve: {
          engagement: function() {
            return vm.selectedEngagement;
          }
        }
      });
      modalInstance.result.then(function() {
        loadEngagements();
      });
    }
  }
}).call(this);