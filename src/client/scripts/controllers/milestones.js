(function() {
  'use strict';
  angular.module('app').controller('MilestonesCtrl', MilestonesCtrl);

  MilestonesCtrl.$inject = [
  '$scope', '$location', 'MilestonesSvc', '$stateParams','AppConfig'
  ];

  function MilestonesCtrl($scope, $location,MilestonesSvc, $stateParams,AppConfig) {
    var vm = this;
    var projectId = $stateParams.projectId;
    var milestoneId = $stateParams.id;

    vm.openDate = openDate;
    vm.save=save;
    vm.statuses=AppConfig.Status;

    loadMilestones();
    loadMilestone(); 

    vm.dateOptions = {
      'year-format': 'yy',
      'starting-day': 1,
      'estimatedStartDateOpened': false,
      'estimatedEndDateOpened': false,
      'actualStartDateOpened': false,
      'actualEndDateOpened': false
    };

    vm.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'shortDate'];

    function openDate($event, field) {
      $event.preventDefault();
      $event.stopPropagation();
      vm.dateOptions[field] = true;
    }

    function addWeekdays(dt, days){
      var resultDt = moment(dt);

      var i=1;
      while(i<=days){
        resultDt = moment(resultDt).add(1,'day');       
        while (resultDt.isoWeekday() === 6 || resultDt.isoWeekday() === 7){
          resultDt = resultDt.add(1,'day');              
        } 
        i++;
      }     

      return resultDt;
    }

    function loadMilestones(){      
      MilestonesSvc.list(projectId).then(function(resp) {
        vm.milestones = resp;
        if(vm.milestones){
          vm.lastmilestone=resp[vm.milestones.length-1];
        }
        if (milestoneId && milestoneId === 'new'){
          vm.milestone = {
            'ProjectID': projectId, 
            'Ordinal': 1, 
            'EstimatedStartDate': new Date(), 
            'EstimatedDuration': 7,
            'EstimatedEndDate': moment().add(7,'day').toDate(),
            'Status': 0
          };
          addWatchOnEstimatedDuration();
          if(vm.lastmilestone){
            vm.milestone.Ordinal = vm.lastmilestone.Ordinal+1;
            vm.milestone.EstimatedStartDate = addWeekdays(vm.lastmilestone.EstimatedEndDate, 1).toDate();
            vm.milestone.EstimatedEndDate = moment(vm.milestone.EstimatedStartDate).add(7,'day').toDate();
          }
        }
      });
    }


    function loadMilestone() {
      if (milestoneId && milestoneId !== 'new'){

       MilestonesSvc.get(projectId, milestoneId).then(function(resp) {
        vm.milestone = resp;
        addWatchOnEstimatedDuration();
      });
     }
   }   

   function save(){
    MilestonesSvc.save(vm.milestone).then(function(){
      $location.path('app/projects/'+vm.milestone.ProjectID);
    });
  }

  function addWatchOnEstimatedDuration(){
   $scope.$watch(function(){
    return vm.milestone.EstimatedDuration;
  }, function(){
    vm.milestone.EstimatedEndDate = addWeekdays(vm.milestone.EstimatedStartDate, vm.milestone.EstimatedDuration).toDate();
  });
 }
}
}).call(this);