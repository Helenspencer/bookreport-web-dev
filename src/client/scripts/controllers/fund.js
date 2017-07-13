(function() {
  'use strict';
  angular.module('app').controller('FundsCtrl', FundsCtrl);

  FundsCtrl.$inject = ['FundSvc', '$stateParams', '$location', 'TradeSvc'];


  function FundsCtrl(FundSvc, $stateParams, $location, TradeSvc) {
    var vm = this;    
    vm.openDate = openDate;
    vm.dateOptions = {
      'year-format': 'yy',
      'starting-day': 1,
      'dueDateOpened': false,
      
    };

    vm.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'shortDate'];
    vm.format = vm.formats[0];
    vm.save=save;
    vm.removeDocument = removeDocument;

    loadFund();

    function loadFund(){
      var fundId = $stateParams.id;
      if (fundId && fundId !== 'new'){
        FundSvc.getFund(fundId).then(function(resp){
          vm.fund=resp;  
          if(!vm.fund.Documents){
            vm.fund.Documents = [];
          }         
          vm.fund.Documents.push({'NewRow': true});
          TradeSvc.getTrades(vm.fund.EntityID).then(function(resp){
            vm.trades = resp;
          });
        });
      } else{
        loadTemplate();
      }
    }
  

    function openDate($event, field) {
      $event.preventDefault();
      $event.stopPropagation();

      vm.dateOptions[field] = true;
    }

    function loadTemplate(){
     FundSvc.getTemplates().then(function(resp) {
      vm.fundTemplate = resp[0] || {};
      if(!vm.fundTemplate.Documents){
        vm.fundTemplate.Documents = [];
      } 
      vm.fundTemplate.Documents.push({'NewRow': true});
      vm.fund = angular.copy(vm.fundTemplate);
      vm.fund.DueDate = moment().add(7, 'days').toDate();
      vm.fund.ProjectID = $stateParams.projectId;
      delete vm.fund.EntityID;
    });
   }   

   function save(inputFund) {      
    var fund = inputFund || vm.fund;    
    var documents = [];
    fund.Documents.forEach(function(item){
      if(item.NewRow){
        delete item.NewRow;
      }
      if(item.Name){
        documents.push(item);
      }
    });
    fund.Documents = documents;
    FundSvc.saveFund(fund).then(function(resp) {
      vm.fund = resp;
      vm.fund.Documents.push({'NewRow': true});
      $location.path('/app/projects/'+vm.fund.ProjectID+'/funds/'+vm.fund.EntityID);
    });     
  }


  function removeDocument(id) {
    var fund = vm.fund.EntityID ? angular.copy(vm.fund) : vm.fund;
    fund.Documents.splice(id, 1);
    if (fund.EntityID) {
      save(fund);      
    }
  }
}
})();