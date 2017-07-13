(function() {
  'use strict';
  angular.module('documentApp').controller('LegalEntityCtrl', LegalEntityCtrl);

  LegalEntityCtrl.$inject = ['$modalInstance', 'legalEntityId', '$modal', 'token', 'LegalEntitySvc','fileId', 'DocumentSvc', 'dialogs'];

  function LegalEntityCtrl($modalInstance, legalEntityId, $modal, token, LegalEntitySvc, fileId, DocumentSvc, dialogs) {
    var vm = this;    

    vm.legalEntityId = legalEntityId || undefined;
    vm.token=token;
    vm.fileId = fileId;

    initializeData();

    vm.ok=ok;
    vm.cancel=cancel;
    vm.showPartyModal=showPartyModal;
    vm.partyAssociatedWithDocument=partyAssociatedWithDocument;
    vm.partyChanged=partyChanged;   

    function initializeData(){   
      if(vm.legalEntityId){
        DocumentSvc.get(vm.token, vm.fileId).then(function(resp){
          vm.documentId = resp.EntityID;
          vm.documentParties = resp.Parties;          
          LegalEntitySvc.get(vm.token, vm.legalEntityId).then(function(resp){
            vm.legalEntity = resp;
          });
        });
      }      
    }


    function cancel(){
      $modalInstance.dismiss('cancel');
    }

    function ok(){            
      $modalInstance.close(vm.legalEntity);      
    }

    function showPartyModal(party) {
      var modalInstance;
      modalInstance = $modal.open({
        templateUrl: 'views/document/modals/party-modal.html',
        controller: 'PartyCtrl as modal'        
      });
      modalInstance.result.then(function(party) {
       party.LegalEntityID = vm.legalEntity.EntityID;
       party.DocumentID = vm.documentId;
       LegalEntitySvc.addParty(vm.token, party).then(function(){
        initializeData();
      });
     });
    }

    function partyAssociatedWithDocument(party){
      var result = false;
      
      if(!vm.documentParties){
        return;
      }
      vm.documentParties.forEach(function(item){
        if(party.EntityID === item.EntityID){
          result = true;
        }
      });
      return result;
    }

    function partyChanged(party){
      var dlg;
      if(partyAssociatedWithDocument(party))
      {        
        dlg = dialogs.confirm('Remove "' + party.Name + '" from the document?', '');
        dlg.result.then(function() {
          DocumentSvc.removePartyFromDocument(vm.token,getDocumentPartyId(party.EntityID)).then(function(){
            initializeData();
          });
        }, function(){
          initializeData();
        });        
      } else{        
        dlg = dialogs.confirm('Add "' + party.Name + '" to the document?', '');
        dlg.result.then(function() {
          var data={"DocumentID": vm.documentId, "PartyID": party["EntityID"]}
          DocumentSvc.addDocumentParty(token, data).then(function(){
            initializeData();
          });
        }, function(){
          initializeData();
        });        
      }
    }

    function getDocumentPartyId(partyId){
      var documentPartyId;

      vm.documentParties.forEach(function(item){
        if(partyId === item.EntityID){
          documentPartyId = item.DocumentPartyID;
        }
      });

      return documentPartyId;
    }

  }
}).call(this);