(function () {
    'use strict';
    angular.module('documentApp').controller('DocumentPageCtrl', DocumentPageCtrl);

    DocumentPageCtrl.$inject = ['$modalInstance', '$modal', 'token', 'fileId', 'DocumentSvc', 'pageNumber', '$sce', '$timeout'];

    function DocumentPageCtrl($modalInstance, $modal, token, fileId, DocumentSvc, pageNumber, $sce, $timeout) {
        var vm = this;
        vm.token = token;
        vm.fileId = fileId;
        vm.canSave = false;
        vm.pageNumber=pageNumber;
        initializeData();

        vm.ok = ok;
        vm.cancel = cancel;
        vm.saveHOCRData = saveHOCRData;        

        $timeout(function () {
            $(".modal-dialog").draggable({handle: '.modal-header, .modal-footer'});

            var resizeOpts = {
                handles: "all", autoHide: true
            };

            $(".modal-dialog").resizable(resizeOpts);
        }, 0);

        function initializeData() {
            DocumentSvc.getEditablePageContent(vm.token, vm.fileId, pageNumber).then(function(resp){
                vm.data = resp; 
                /*console.log(vm.data.HOCRContent);*/                 
                vm.data.HOCRContentBody=$($.parseXML(vm.data.HOCRContent))
                .find("body").html();
                /*console.log(vm.data.HOCRContentBody);*/
            });
        }

        function saveHOCRData(){
            vm.savingPageData = true;
            var htmlDoc = $.parseXML(vm.data.HOCRContent);
            $(htmlDoc)
                .find("body").replaceWith("<body>"+vm.data.HOCRContentBody+"</body>");                        
            var data = {updtaedHOCRContent:(new XMLSerializer()).serializeToString(htmlDoc)}            
            /*console.log(data.updtaedHOCRContent);*/
            DocumentSvc.updateHOCRContent(vm.token, vm.fileId, vm.pageNumber, data).then(function(resp){
                /*console.log(resp);*/
                vm.savingPageData = false;
            });
}

function cancel() {
    $modalInstance.dismiss('cancel');
}

function ok() {
    $modalInstance.close(vm.legalEntity);
}
}
}).call(this);
