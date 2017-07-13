(function() {
  'use strict';
  angular.module('app').controller('DocumentTypesCtrl', DocumentTypesCtrl);

  DocumentTypesCtrl.$inject = [ '$stateParams', '$location', 'DocumentTypeSvc','AppConfig', 'dialogs'];


  function DocumentTypesCtrl($stateParams, $location, DocumentTypeSvc,AppConfig, dialogs) {
    var vm = this;
    
    vm.save=save;  
    vm.removeDocumentType = removeDocumentType;
    vm.dataTypes = AppConfig.DataTypes;
    vm.edit = edit;

    loadDocumentTypes();

    function edit(documentType){
      $location.path('/app/documentTypes/'+documentType.EntityID);
    }

    function save(docType, stayOnPage){
      var documentType = (docType && docType.Name)?docType : vm.documentType;
      var documentTypes = [];
      
      if(documentType.Data){
        documentType.Data.forEach(function(item){
          if(item.NewRow){
            delete item.NewRow;
          }
          if(item.Name){
            documentTypes.push(item);
          }
        });  

        documentType.Data = documentTypes;
      }

      DocumentTypeSvc.saveType(documentType).then(function(resp){
        if(stayOnPage){
          if($stateParams.id && $stateParams.id != 'new'){
            loadDocumentTypes();            
          } else{
            edit(resp);
          }
          
        } else{
          $location.path('app/documentTypes');  
        }
      });
    }

    function loadDocumentTypes() {
      var documentTypeId = $stateParams.id;      
      if (documentTypeId) {
        if (documentTypeId !== 'new') {
          DocumentTypeSvc.getType(documentTypeId).then(function(resp) {
            vm.documentType = resp;
            if(!vm.documentType.Data){
              vm.documentType.Data=[];
            }
            vm.documentType.Data.push({'NewRow': true, 'DataType': 0});
          });
        } else
        {
         vm.documentType = {
          'Data': [{'NewRow': true, 'DataType': 0}]
        };
      }
    } else {
      DocumentTypeSvc.getTypes().then(function(resp) {
        vm.documentTypes = resp;
      });
    }
  }

  function removeDocumentType(id){    
    var documentType = vm.documentType.EntityID?angular.copy(vm.documentType): vm.documentType;
    documentType.Data.splice(id,1);
    if(documentType.EntityID){
      save(documentType, true);
    }      
  }
}
})();