(function () {
    'use strict';
    angular.module('documentApp').controller('EditablePageCtrl', EditablePageCtrl);

    EditablePageCtrl.$inject = ['$modalInstance', '$modal', 'token', 'fileId', 'DocumentSvc', 'groundTruthItem', '$sce', '$timeout'];

    function EditablePageCtrl($modalInstance, $modal, token, fileId, DocumentSvc, groundTruthItem, $sce, $timeout) {

        var vm = this;
        vm.token = token;
        vm.fileId = fileId;
        vm.groundTruthItemId = groundTruthItem["EntityID"];
        vm.savingPageData = false;
        vm.viewingRevisions = false;
        vm.viewingText = false;
        vm.canSave = false;
        var _gettingRevision = false;
        initializeData();

        vm.ok = ok;
        vm.cancel = cancel;
        vm.savePageData = savePageData;
        vm.viewRevisions = viewRevisions;
        vm.viewOriginalTruthData = viewOriginalTruthData;
        vm.changeToRevision = changeToRevision;
        vm.viewText = viewText;
        vm.correctionDataChanged=correctionDataChanged;
        vm.IsCorrectionDataChanged = false;

          $timeout(function () {
                            $(".modal-dialog").draggable({handle: '.modal-header, .modal-footer'});

                            var resizeOpts = {
                                handles: "all", autoHide: true
                            };

                            $(".modal-dialog").resizable(resizeOpts);
                        }, 0);

        function initializeData() {
            vm.correctionData = "Loading...";
            vm.loadingGroundTruth = true;
            DocumentSvc.getGroundTruthCorrectionHtml(vm.token, vm.fileId, vm.groundTruthItemId).then(function (resp) {                
                if (resp.data) {
                    vm.correctionData = resp.data;
                    vm.canSave = true;
                    vm.revisions = resp.revisions;
                    if (vm.revisions && vm.revisions.length > 0) {
                        vm.revisions[0].viewing = true;
                        vm.revisions[0].isEditable = true;
                    }
                } else {
                    vm.revisions = [];
                }
            });
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

        function ok() {
            $modalInstance.close(vm.legalEntity);
        }

        function savePageData() {
            if (vm.savingPageData) {
                return;
            }
            vm.savingPageData = true;
            var updatedData = document.getElementById("correctedPageData").innerHTML;
            DocumentSvc.updateGroundTruthCorrectionHtml(vm.token, vm.fileId, vm.groundTruthItemId, {
                updatedData: updatedData
            }).then(function (resp) {
                /*cancel();*/
                vm.savingPageData = false;
                vm.IsCorrectionDataChanged = false;
            });
        }

        function viewRevisions() {
            vm.viewingRevisions = !vm.viewingRevisions;
            vm.viewingText = false;
        }

        function _deselectRevisions() {
            vm.revisions = vm.revisions.map(function (revision) {
                revision.viewing = false;
                return revision;
            });
        }

        function _startLoading(newOriginalTruthDataActive) {
            vm.viewingText = false;
            vm.correctionData = "Loading...";
            vm.viewingRevisions = false;
            vm.originalTruthDataActive = newOriginalTruthDataActive;
            vm.canSave = false;
            _deselectRevisions();
        }

        function _getRevisionHtml(entityId) {
            if (_gettingRevision) {
                return;
            }
            _gettingRevision = true;
            DocumentSvc.getGroundTruthRevisionHtml(vm.token, vm.fileId, vm.groundTruthItemId, entityId).then(function (resp) {
                _gettingRevision = false;
                vm.correctionData = resp.data;
            });
        }

        function viewOriginalTruthData() {
            _startLoading(true);
            _getRevisionHtml("original");
        }

        function changeToRevision(revision) {
            _startLoading(false);
            if (revision.isEditable) {
                initializeData();
            } else {
                revision.viewing = true;
                _getRevisionHtml(revision.EntityID);
            }
        }

        function viewText() {
            vm.viewingText = !vm.viewingText;
            if (!vm.viewingText) {
                return;
            }
            var textToParse = null;
            if (typeof(vm.correctionData) === "object") {
                textToParse = vm.correctionData.$$unwrapTrustedValue();
            } else {
                textToParse = vm.correctionData;
            }
            var fakeBody = document.createElement("body");
            fakeBody.innerHTML = textToParse;
            var tds = fakeBody.getElementsByTagName("td");
            var resultingText = "";
            for (var i = 0; i < tds.length; i++) {
                var thisTd = tds[i];
                if (thisTd.hasAttribute("contenteditable")) {
                    resultingText += thisTd.innerHTML + "<br />";
                }
            }
            vm.resultingText = $sce.trustAsHtml(resultingText);
        }

        function correctionDataChanged(changed){
            vm.IsCorrectionDataChanged = changed;
            console.log('vm.IsCorrectionDataChanged: ', vm.IsCorrectionDataChanged);
        }
    }
}).call(this);
