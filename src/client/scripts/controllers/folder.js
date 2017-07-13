(function() {
  'use strict';
  angular.module('app').controller('FolderCtrl', FolderCtrl);

  FolderCtrl.$inject = ['$scope', '$modalInstance', 'FolderSvc', 'folder', 'ProjectSvc'];


  function FolderCtrl($scope, $modalInstance, FolderSvc, folder, ProjectSvc) {
    var vm = this;
    vm.cancel = cancel;
    vm.createFolder = createFolder;

    vm.folder = folder;

    function cancel() {
      $modalInstance.dismiss();
    }

    function createFolder() {
      if (vm.folder.Type === 1) {
          ProjectSvc.save(vm.folder).then(function() {
          $modalInstance.close();
        });
      } else {
        FolderSvc.save(vm.folder).then(function() {
          $modalInstance.close();
        });
      }
    }
  }
})();