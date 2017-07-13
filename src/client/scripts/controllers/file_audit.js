(function() {
  'use strict';
  angular.module('app').controller('FileAuditCtrl', FileAuditCtrl);

  FileAuditCtrl.$inject = ['$modalInstance', 'FileAuditSvc', 'AppConfig', 'fileAudit'];


  function FileAuditCtrl($modalInstance, FileAuditSvc, AppConfig, fileAudit) {
    var vm= this;
    
    if(fileAudit.folderId){
     vm.folderId = fileAudit.folderId;
   }else if(fileAudit.projectId){
    vm.projectId = fileAudit.projectId;
  }  

  vm.cancel = cancel;
  vm.actionValues = AppConfig.Actionvalues;

  getFolderHistory();

  function cancel() {
    $modalInstance.close();
  }

  function getFolderHistory() {
    FileAuditSvc.list(vm.folderId, vm.projectId, vm.fileId).then(function(resp){
      console.log(resp)
      vm.folderHistoryResult = resp;
    });
  }
}
})();
