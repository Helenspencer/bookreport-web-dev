(function() {
  'use strict';
  angular.module('app').controller('TradeTypesCtrl', TradeTypesCtrl);

  TradeTypesCtrl.$inject = [ '$stateParams', '$location', 'TradeSvc'];


  function TradeTypesCtrl($stateParams, $location, TradeSvc) {
    var vm = this;
    
    vm.save=save;  
    vm.removeDocument = removeDocument;
    vm.removeData=removeData;

    loadTradeTypes();

    function save(trType){
      var tradeType = trType || vm.tradeType;
      var documents = [];
      var data=[];
      tradeType.Documents.forEach(function(item){
        if(item.NewRow){
          delete item.NewRow;
        }
        if(item.Name){
          documents.push(item);
        }
      });
      tradeType.Documents = documents;
      tradeType.Data.forEach(function(item){
        if(item.NewRow){
          delete item.NewRow;
        }
        if(item.Name){
          data.push(item);
        }
      });
      tradeType.Data = data;
      TradeSvc.saveType(tradeType).then(function(resp){
        $location.path('app/tradeTypes/'+resp.EntityID);
        loadTradeTypes();
      });
    }

    function loadTradeTypes() {
      var tradeTypeId = $stateParams.id;

      if (tradeTypeId) {
        if (tradeTypeId !== 'new') {
          TradeSvc.getType(tradeTypeId).then(function(resp) {
            vm.tradeType = resp; 
            if(!vm.tradeType.Documents){
              vm.tradeType.Documents=[];
            }
            vm.tradeType.Documents.push({'NewRow': true});
            if(!vm.tradeType.Data){
              vm.tradeType.Data=[];
            }
            vm.tradeType.Data.push({'NewRow': true});
          });
        } else {
          vm.tradeType = {
            'Documents': [{'NewRow': true}],
            'Data': [{'NewRow': true}]
          };
        }
      } else {
        TradeSvc.getTypes().then(function(resp) {
          vm.tradeTypes = resp;
        });
      }
    }

    function removeDocument(id){
      var tradeType = vm.tradeType.EntityID?angular.copy(vm.tradeType): vm.tradeType;
      tradeType.Documents.splice(id,1);
      if(tradeType.EntityID){
        save(tradeType);
      }      
    }

    function removeData(id){
      var tradeType = vm.tradeType.EntityID?angular.copy(vm.tradeType): vm.tradeType;
      tradeType.Data.splice(id,1);
      if(tradeType.EntityID){
       save(tradeType);
     }      
   }
 }
})();