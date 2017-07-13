(function() {
  'use strict';
  angular.module('app').controller('ProjectTypesCtrl', ProjectTypesCtrl);

  ProjectTypesCtrl.$inject = [ '$stateParams', '$location', 'ProjectSvc', 'dialogs'];

  function ProjectTypesCtrl($stateParams, $location, ProjectSvc, dialogs) {
    var vm = this;
    
    vm.save=save;  
    vm.removeType=removeType;
    vm.milestonesIsOpen = true;
    vm.addMilestone=addMilestone;
    vm.deleteMilestone=deleteMilestone;

    loadProjectTypes();

    function save(gotoList){   

      ProjectSvc.saveType(vm.projectType).then(function(resp){
        if(gotoList){
           $location.path('app/projectTypes');
        } else{
           $location.path('app/projectTypes/'+resp.EntityID);
        }       
      });
    }

    function loadProjectTypes() {
      var projectTypeId = $stateParams.id;

      if (projectTypeId) {
        if (projectTypeId !== 'new') {
          ProjectSvc.getType(projectTypeId).then(function(resp) {
            vm.projectType = resp;
            if(!vm.projectType.Milestones){
              vm.projectType.Milestones = [];
            }    
            vm.projectType.Milestones.push({'NewRow': true});      
          });
        } else {
          vm.projectType = {};
        }
      } else {
        ProjectSvc.getTypes().then(function(resp) {
          vm.projectTypes = resp;
        });
      }
    }    

    function removeType(){
     var dlg;
     dlg = dialogs.confirm('Remove "' + vm.selectedProjectType.Name + '"?', '');
     dlg.result.then(function() {
      ProjectSvc.removeType(vm.selectedProjectType.EntityID).then(function() {
        loadProjectTypes();
      });
    });
   }

   function addMilestone(){
    ProjectSvc.saveType(vm.projectType).then(function(resp){
      vm.projectType = resp;
      vm.projectType.Milestones.push({'NewRow': true});
    });    
  }

  function deleteMilestone(index){
    vm.projectType.Milestones.splice(index,1);
    ProjectSvc.saveType(vm.projectType).then(function(resp){
      vm.projectType = resp;
      vm.projectType.Milestones.push({'NewRow': true});

    });  
  }
}
})();