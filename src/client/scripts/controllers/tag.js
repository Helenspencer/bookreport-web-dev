(function() {
  'use strict';
  angular.module('cedarwood-common').controller('TagsCtrl', TagsCtrl);

  TagsCtrl.$inject = ['$scope', '$modalInstance', 'TagsSvc', '$rootScope', 'dialogs', 'token'];


  function TagsCtrl($scope, $modalInstance, TagsSvc, $rootScope, dialogs, token) {
    var vm = this;

    vm.currentPage = 1;
    vm.itemsPerPage = 10;
    vm.ok = ok;
    vm.removeTag=removeTag;
    vm.updateTag = updateTag;
    vm.removeInProgress=false;
    vm.closeAlert = closeAlert;
    vm.pageChange = pageChange;
    vm.switchPage = switchPage;
    vm.getPagesArray = getPagesArray;
    vm.getNumPages = getNumPages;
    vm.token = token;

    getOrgTags();

    $scope.$watch(function () {
      vm.inputTag = vm.tag;
      return vm.inputTag;
    }, function (nv, ov) {
      if (!angular.equals(nv,ov)) {
        getOrgTags();
      }
    });

    function getOrgTags(){
      TagsSvc.list(vm.token, vm.inputTag, undefined, undefined, vm.currentPage, vm.itemsPerPage).then(function(resp){
        var orgTags = resp['OrgTags'];
        vm.tags = orgTags['Tags'];
        vm.totalTags = orgTags['TotalTags'];
      });
    }

    function switchPage(value) {
      var page = Math.max(1, Math.min(getNumPages(), vm.currentPage + parseInt(value)));

      if (page !== vm.currentPage) {
        vm.currentPage = page;
        vm.pageChange();
      }
    }

    function pageChange(){
      getOrgTags();
    }

    function getNumPages() {
      return Math.ceil(vm.totalTags / vm.itemsPerPage);
    }

    function getPagesArray() {
      return new Array(getNumPages());
    }

    function removeTag(tagID) {
      var dlg;
      dlg = dialogs.confirm('Are you sure you want to remove this tag?  Once it'+ "'s gone, it'" + 's gone');
      dlg.result.then(function() {
        vm.removeInProgress=true;
        TagsSvc.remove(vm.token, tagID).then(function() {
          vm.removeInProgress=false;
          $modalInstance.close();
        });
      });
    }

    function updateTag(tag){
      TagsSvc.update(vm.token, tag).then(function() {
        $modalInstance.close();
      },function error(resp){
        if(resp.data && resp.data.errorCode && resp.data.errorCode === 702){
          vm.tagAlerts=[{'msg':'DUPLICATE TAG: '+tag.Name+' is already existed!', 'type':'danger'}];
        }
      });
    }

    function closeAlert(index){
      if(vm.tagAlerts){
        vm.tagAlerts.splice(index, 1);
      }
    }

    function ok() {
      $modalInstance.close();
    }
  }
})();