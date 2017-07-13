(function() {
  'use strict';
  angular.module('app').controller('ProjectCtrl', ProjectCtrl);

  ProjectCtrl.$inject = ['$scope', '$modalInstance', 'ProjectSvc', 'engagement'];


  function ProjectCtrl($scope, $modalInstance, ProjectSvc, engagement) {
    var vm = this;

    vm.cancel = cancel;
    vm.createProject = createProject;
    vm.engagement = engagement;

    vm.project = {'Name': '', 'EngagementID' : vm.engagement.EntityID};

    function cancel() {
      $modalInstance.dismiss();
    }

    function createProject(){
      ProjectSvc.save(vm.project).then(function(){
        $modalInstance.close();
      });
    }
  }
})();