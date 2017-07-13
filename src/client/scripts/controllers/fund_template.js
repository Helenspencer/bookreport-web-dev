(function() {
  'use strict';
  angular.module('app').controller('FundTemplatesCtrl', FundTemplatesCtrl);

  FundTemplatesCtrl.$inject = ['FundSvc'];


  function FundTemplatesCtrl(FundSvc) {
    var vm = this;
    vm.save = save;    
    vm.removeDocument = removeDocument;

    loadFundTemplates();

    function save(fTemplate) {      
      var fundTemplate = fTemplate || vm.fundTemplate;      
      var documents = [];
      fundTemplate.Documents.forEach(function(item){
        if(item.NewRow){
          delete item.NewRow;
        }
        if(item.Name){
          documents.push(item);
        }
      });
      fundTemplate.Documents = documents;
      FundSvc.saveTemplate(fundTemplate).then(function(resp) {
        vm.fundTemplate = resp;
        vm.fundTemplate.Documents.push({'NewRow': true});
      });     
    }

    function loadFundTemplates() {
     FundSvc.getTemplates().then(function(resp) {
      vm.fundTemplate = resp[0] || {};
      if(!vm.fundTemplate.Documents){
        vm.fundTemplate.Documents = [];
      }           
      vm.fundTemplate.Documents.push({'NewRow': true});
    });
   }  

   function removeDocument(id) {
    var fundTemplate = vm.fundTemplate.EntityID ? angular.copy(vm.fundTemplate) : vm.fundTemplate;
    fundTemplate.Documents.splice(id, 1);
    if (fundTemplate.EntityID) {
      save(fundTemplate);      
    }
  }
}
})();