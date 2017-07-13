(function() {
  'use strict';
  angular.module('app').controller('FileUploadCtrl', FileUploadCtrl);

  FileUploadCtrl.$inject = [
  '$scope','$filter', '$modalInstance', 'projectsAndFolders', 'selectedItem', 'TagsSvc', '$interval', '$rootScope', 'uuid4','fileToBeReplaced', 'SessionService'
  ];


  function FileUploadCtrl($scope, $filter,$modalInstance, projectsAndFolders, selectedItem, TagsSvc, $interval, $rootScope, uuid4,fileToBeReplaced, SessionService) {
    var vm = this;
    vm.currentPage = 1;
    vm.itemsPerPage = 10;
    vm.pageSizes=[10,20,50,100];
    vm.pageChange=pageChange;
    vm.deleteFile=deleteFile;

    $rootScope.fileToBeReplaced = fileToBeReplaced;
    pageChange();

    if(projectsAndFolders && projectsAndFolders.length>0){      
      vm.projectsAndFolders = projectsAndFolders;
      $rootScope.projectsAndFolders = projectsAndFolders;
    }

    if (selectedItem && selectedItem.EntityID) {
      $rootScope.selectedItem = selectedItem;
    } else if (projectsAndFolders && projectsAndFolders.length > 0) {
      $rootScope.selectedItem = projectsAndFolders[0];
    }

    vm.cancel = cancel;
    vm.getFileTypeClass = getFileTypeClass;
    vm.uploadFiles = uploadFiles;    
    vm.loadTags = loadTags;
    vm.startUpload=startUpload;
    vm.close=closeModal;
    vm.fileToBeReplaced=fileToBeReplaced;
    vm.selectItem = selectItem;

    vm.flattenZip = false;
    
    $scope.$watch(function() {
      return vm.files;
    }, function() {
      if(vm.files){                
        var files = [];

        if( Object.prototype.toString.call( vm.files ) === '[object Array]' ) {
          //Removing directories
          vm.files.forEach(function(item){
            if(!item.type || item.type !== 'directory'){
              item.uuid = uuid4.generate();
              files.push(item);
            }
          }); 
        } else{
          var file = vm.files;
          file.uuid = uuid4.generate();
          files.push(file);
        }

        if(!$rootScope.filesToBeUploaded){
          $rootScope.filesToBeUploaded = [];
        }
        $rootScope.filesToBeUploaded = $rootScope.filesToBeUploaded.concat(files);      
      }      
    });

    function cancel() {
      $rootScope.filesToBeUploaded = undefined;
      $modalInstance.close();
    }

    function closeModal() {      
      $modalInstance.close();
    }

    function getFileTypeClass(file) {
      if (file) {
        var fields = file.name.split('.');
        var fileType = fields[fields.length - 1];
        if (fileType === 'txt') {
          return 'fa-file-text-o';
        } else if (fileType === 'pdf') {
          return 'fa-file-pdf-o';
        } else if (fileType === 'doc' || fileType === 'doc') {
          return 'fa-file-word-o';
        } else{
          return 'fa-question';
        }
      }
    }

    $scope.$watch(function(){
      return vm.searchCriteria;
    }, function(){
      vm.currentPage=1;
      pageChange();
    });
    
    $scope.$watch(function(){
      return $rootScope.filesToBeUploaded;
    }, function(){
      vm.currentPage=1;
      pageChange();
    });

    function uploadFiles(files) {
      if(files){
        $rootScope.filesToBeUploaded = files;
      }
      pageChange();
    }  

    function pageChange() {
      if(!$rootScope.filesToBeUploaded){
        return;
      }

      var position = (vm.currentPage - 1) * vm.itemsPerPage;

      if(vm.searchCriteria)
      {
       vm.filteredUploadFiles = $filter('filter')($rootScope.filesToBeUploaded,vm.searchCriteria).slice(position, position + vm.itemsPerPage);
       vm.totalItems = ($filter('filter')($rootScope.filesToBeUploaded,vm.searchCriteria)).length;
     }
     else{
      vm.filteredUploadFiles = $rootScope.filesToBeUploaded.slice(position,position + vm.itemsPerPage);
      vm.totalItems=$rootScope.filesToBeUploaded.length;
    }
  }

  $scope.$watch(function(){
    return vm.itemsPerPage;
  }, function(nv, ov){
    if(!angular.equals(nv, ov)){
      vm.currentPage=1;
      pageChange();
    }
  });

  function startUpload(){
    if($rootScope.filesToBeUploaded.length>1 && vm.tags.length>0){
      createTags();
    }
    $rootScope.$emit('fileUpload', vm.flattenZip, vm.tags,vm.fileToBeReplaced);
  }

  function createTags(){
    vm.tagsPlainArray = [];
    vm.tags.forEach(function(tag){
      vm.tagsPlainArray.push(tag.text)
    });
    var personalTag = true;
    var token = SessionService.getToken().value.split(' ')[1];
    if($rootScope.user.IsCedarwoodUser){
      personalTag = false;
    }
    var data = {'Tags':vm.tagsPlainArray, 'PersonalTag': personalTag};
    return  TagsSvc.save(token, data);
  }

  function loadTags(query) {
    var token = SessionService.getToken().value.split(' ')[1];
    return TagsSvc.list(token, query, $rootScope.user.IsCedarwoodUser?undefined:$rootScope.user.UserAccountID, $rootScope.user.IsCedarwoodUser?'org':'personal', undefined, undefined);
  } 

  $rootScope.$on('closeUploadModal',function(){
    $modalInstance.close();
  });   

  function selectItem(item){
    $rootScope.selectedItem = item;    
  }

  function deleteFile(index) {    
    $rootScope.filesToBeUploaded.splice(index, 1);
    pageChange();
  }
}
})();