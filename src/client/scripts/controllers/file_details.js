(function() {
  'use strict';
  angular.module('app').controller('FileDetailsCtrl', FileDetailsCtrl);

  FileDetailsCtrl.$inject = [
  '$scope', '$location', '$stateParams', 'FileSvc','FolderSvc','ProjectSvc', 'SessionService', 'ENV'
  ];

  function FileDetailsCtrl($scope, $location, $stateParams,FileSvc,FolderSvc,ProjectSvc, SessionService, ENV) {
    var vm = this;

    var id = $stateParams.id;
    getFile();

    vm.endPoint = ENV.apiEndpoint;
    vm.token = SessionService.getToken().value.split(' ')[1];

    function loadFile() {      
      FileSvc.get(id).then(function(resp) {
        vm.file = resp;
        if(vm.file.ProjectID && vm.file.ProjectID!=='null')
        {
          ProjectSvc.get(vm.file.ProjectID).then(function(resp){
            vm.project = resp;
          });
        }
        else 
        {
         FolderSvc.get(vm.file.FolderID).then(function(resp){
           vm.folder = resp;           
         });

       }
     });
    }

    function getFile() {
      loadFile();
      loadDocument();
    }

    function loadDocument(){
      FileSvc.getFileDocument(id).then(function(resp){
        vm.fileDocument = resp;        
      });
    }
  }
}).call(this);