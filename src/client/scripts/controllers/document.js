(function () {
    'use strict';
    angular.module('documentApp').controller('DocumentCtrl', DocumentCtrl);

    DocumentCtrl.$inject = ['DocumentSvc', '$scope', '$modal', 'LegalEntitySvc', 'dialogs', '$controller', '$rootScope', '$sce', 'TagsSvc'];

    function DocumentCtrl(DocumentSvc, $scope, $modal, LegalEntitySvc, dialogs, $controller, $rootScope, $sce, TagsSvc) {
        var vm = this;

        vm.selectedDocumentType = {};
        vm.save = save;
        vm.showLegalEntityModal = showLegalEntityModal;
        vm.refreshLegalEntities = refreshLegalEntities;
        vm.documentSections = [{}, {}, {}];
        vm.documentTextStyle = {'max-height': 1000};
        vm.toggleDocumentText=toggleDocumentText;
        vm.initializeDocument=initializeDocument;
        vm.pdfSize = pdfSize;
        vm.copyText = copyText;
        vm.isCollapse = true;
        vm.excelView = false;
        vm.editedRow = -1;
        vm.updateTags = updateTags;
        vm.loadTags = loadTags;
        vm.listTags = listTags;
        vm.editTags = editTags;
        vm.getTagsPlainArray = getTagsPlainArray;
        vm.closeTagEditor = closeTagEditor;


        vm.dateOptions = {
            'year-format': 'yy',
            'starting-day': 1
        };

        vm.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'shortDate'];
        vm.format = vm.formats[0];
        vm.openDate = openDate;

        vm.groups = [{'title':'Tags Editior', 'url':'views/document/tags-editor.html', 'Display':true},
        {'title': 'Legal Entities', 'url': 'views/document/legal-entities.html', 'Display': true},
        {'title': 'Document Values', 'url': 'views/document/document-values.html', 'Display': true},
        {'title': 'Document Training', 'url': 'views/document/document-training.html', 'Display': false}
        ];

        vm.oneAtATime = true;
        vm.isFirstOpen=true;

        vm.formatDateString = function (dateItem) {
            return moment(dateItem).fromNow();
        };

        vm.showEditablePage = function (groundTruthItem) {
            console.log(groundTruthItem);
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'views/document/modals/editable-page.html',
                controller: 'EditablePageCtrl as modal',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    token: function () {
                        return vm.token;
                    },
                    fileId: function () {
                        return vm.fileId;
                    },
                    groundTruthItem: function () {
                        return groundTruthItem;
                    }
                }
            });
            modalInstance.result.then(function () {
                console.log("saved....");
            });
        };

        vm.showDocumentPage = function (pageNumber) {
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'views/document/modals/document-page.html',
                controller: 'DocumentPageCtrl as modal',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    token: function () {
                        return vm.token;
                    },
                    fileId: function () {
                        return vm.fileId;
                    },
                    pageNumber: function(){
                        return pageNumber;
                    }
                }
            });
            modalInstance.result.then(function () {
                console.log("saved....");
            });
        };

        function openDate($event, field) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.dateOptions[field] = true;
        }

        var components = window.location.search.replace('?url=').split('&');

        components.forEach(function (item) {
            var keyValues = item.split('=');
            if (keyValues.length === 2) {
                if (keyValues[0] === 'fileId') {
                    vm.fileId = keyValues[1];
                } else if (keyValues[0] === 'token') {
                    //decodeURIComponent is used in case the token in the URL has any characters
                    //that the browser escapes (= signs in particular)
                    vm.token = decodeURIComponent(keyValues[1]);
                    setUser();
                }
            }
        });

        function setUser(){
            DocumentSvc.getUserProfile(vm.token).then(function(user){
                $rootScope.user = user;
            });
        }

        pdfSize();

        function pdfSize(){
            vm.isCollapse = !vm.isCollapse;
            if (vm.fileId && vm.token) {
                loadDocumentTypes();
            }
            if(!vm.isCollapse){
                $(document).ready(function(){
                    vm.isLoading = false;
                    $(".flexpaper-container").css({"position":"absolute", "left":"0px", "top":"20px", "width":"75%", "height":"100%" });
                });
            }else{
                $(".flexpaper-container").css({"position":"absolute", "left":"0px", "top":"0px", "width":"95%", "height":"100%" });
                $("#pagesContainer_documentViewer").css({"width":"100%"});
            }
        }

        function initializeDocument() {
            DocumentSvc.get(vm.token, vm.fileId).then(function (resp) {
                if (resp.EntityID) {
                    vm.documentObj = resp;
                    vm.selectedDocumentType.Data = vm.documentObj.Data;
                    console.log(vm.selectedDocumentType.Data);
                    vm.GroundTruthData = (resp.GroundTruthData || []).sort(function (a, b) {
                        return a.sub_directory > b.sub_directory;
                    });
                    vm.InitialWorkUpdates = (resp.InitialWorkUpdates || []).sort(function (a, b) {
                        return a.when > b.when;
                    });
                    vm.DocumentText = resp.DocumentText;
                    vm.PageStartsAtOne = false;
                    if (vm.GroundTruthData.length > 0 && vm.GroundTruthData[0].page == "Page_1")
                        vm.PageStartsAtOne = true;
                    watchDocumentType();
                    refreshLegalEntities();
                    $rootScope.$broadcast('documentLoaded');
                    /*$rootScope.$emit('documentLoaded');*/
                }

                loadFile();

            });
            if(vm.fileId && vm.token){
                jQuery.extend({
                    getQueryParameters : function(str) {
                        return (str || document.location.search).replace(/(^\?)/,'').split('&').map(function(n){return n = n.split('='),this[n[0]] = n[1],this}.bind({}))[0];
                    }
                });
                var queryParams = jQuery.getQueryParameters();
                vm.fileUrl = $sce.trustAsResourceUrl(queryParams.url+'/file/'+queryParams.fileId+'/?token='+queryParams.token);
            }
        }

        $rootScope.$on('excelsheetLoaded', function(){
            vm.isLoading = false;
        });

        function loadFile() {
            vm.isLoading=true;
            DocumentSvc.getFile(vm.token, vm.fileId).then(function (resp) {

                vm.file = resp;
        if (!vm.documentObj || !vm.documentObj["EntityID"]){
            vm.documentObj = {'Title': vm.file.Name, 'FileID': vm.file.EntityID};
            watchDocumentType();
            save();
        }

        if(vm.file.OCR){
            vm.groups[3].Display = true;
        }

        window.document.title=vm.file.Name;
    });
        }

        function save() {

            $scope.saving = true;
            if (vm.selectedDocumentType) {
                vm.documentObj.Data = vm.selectedDocumentType.Data;
            }
            DocumentSvc.save(vm.token, vm.documentObj).then(function (resp) {
                $scope.saving = false;
                vm.documentObj = resp;
                initializeDocument();
            }, function () {
                $scope.saving = false;
            });
        }

        function loadDocumentTypes() {
            DocumentSvc.getDocumentTypes(vm.token).then(function (resp) {
                vm.documentTypes = resp;
                initializeDocument();
            });
        }

        function watchDocumentType() {
            $scope.$watch(function () {
                return vm.documentObj.TypeID;
            }, function (nv, ov) {
                if (nv && nv !== ov) {
                    selectDocumentType(nv);
                }
            });
        }

        function selectDocumentType(typeId) {
            vm.documentTypes.forEach(function (item) {
                if (item.EntityID === typeId) {
                    vm.selectedDocumentType = item;
                }
            });
        }

        function showLegalEntityModal(legalEntity, event) {
            event.preventDefault();
            event.stopPropagation();

            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'views/document/modals/legal-entity-modal.html',
                controller: 'LegalEntityCtrl as modal',
                size: 'lg',
                resolve: {
                    legalEntityId: function () {
                        return legalEntity ? legalEntity.LegalEntityID : undefined;
                    },
                    token: function () {
                        return vm.token;
                    },
                    fileId: function () {
                        return vm.fileId;
                    }
                }
            });
            modalInstance.result.then(function (legalEntity) {
                legalEntity.DocumentID = vm.documentObj.EntityID;
                LegalEntitySvc.save(vm.token, legalEntity).then(function () {
                    refreshLegalEntities();
                });
            });
        }

        function updateTags() {
            if (vm.file.Tags) {
                vm.file.Tags = processTags(vm.file.Tags);
                if ($rootScope.user.IsCedarwoodUser) {
                    vm.file.PersonalTag = false;
                } else {
                    vm.file.PersonalTag = true;
                }
            }

            DocumentSvc.saveFile(vm.token, vm.file).then(function () {
                listTags();
            });
        }

        function loadTags(query) {
            return TagsSvc.list(vm.token, query, $rootScope.user.IsCedarwoodUser?undefined:$rootScope.user.UserAccountID, $rootScope.user.IsCedarwoodUser?'org':'personal', undefined, undefined);
        }

        function editTags(index, event) {
            vm.editedRow = index;
            vm.currentTagsEditor = $(event.target).closest('td');
            event.stopPropagation();
            $(document).on('click', documentClick);
        }

        function processTags(tags) {
            var stringTags = [];

            if (tags) {
                tags.forEach(function (tag) {
                    stringTags.push(tag.text || tag);
                });
            }
            return stringTags;
        }

        function listTags() {
            TagsSvc.list(vm.token, undefined, undefined,'org', undefined, undefined).then(function(tags){
                vm.Tags = tags;
            });
        }

        function documentClick(event) {
            if (!vm.currentTagsEditor.find('.tags-editor').has(event.target).length) {
                vm.editedRow = -1;
                $scope.$apply();
                $(document).off('click', documentClick);
            }
        }

        function closeTagEditor() {
            vm.editedRow = -1;
        }

        function getTagsPlainArray(tags) {
            var res = [];

            angular.forEach(tags, function (value) {
                res.push(value.text || value);
            });

            return res;
        }

        function refreshLegalEntities(searchInput) {
            LegalEntitySvc.list(vm.token, searchInput).then(function (resp) {
                vm.legalEntities = resp;
                getDocumentLegalEntities();
            });
        }


        $scope.$watch(function () {
            return vm.selectedLegalEntity;
        }, function (nv, ov) {
            if (nv && nv !== ov) {
                if (isLegalEntityAddedToTheDocument(vm.selectedLegalEntity.EntityID)) {
                    return;
                }
                var dlg;
                dlg = dialogs.confirm('Add "' + vm.selectedLegalEntity.Name + '" to the document?', '');
                dlg.result.then(function () {
                    var data = {"DocumentID": vm.documentObj.EntityID, "LegalEntityID": vm.selectedLegalEntity.EntityID};
                    LegalEntitySvc.addLegalEntityToDocument(vm.token, data).then(function () {
                        vm.selectedLegalEntity = undefined;
                        getDocumentLegalEntities();
                    });
                });
            }
        });

        function isLegalEntityAddedToTheDocument(legalEntityId) {
            var result = false;

            vm.documentLegalEntities.forEach(function (item) {
                if (item.LegalEntityID === legalEntityId) {
                    result = true;
                }
            });

            return result;
        }

        function getDocumentLegalEntities() {
            if (!vm.documentObj) {
                return;
            }

            LegalEntitySvc.getDocumentLegalEntities(vm.token, vm.documentObj.EntityID).then(function (resp) {
                vm.documentLegalEntities = resp;
                vm.documentLegalEntities.forEach(function (item) {
                    item.Name = getLegalEntityName(item.LegalEntityID);
                });

            });
        }

        function getLegalEntityName(legalEntityId) {
            var name;
            vm.legalEntities.forEach(function (item) {
                if (item.EntityID === legalEntityId) {
                    name = item.Name;
                }
            });

            return name;
        }

        $scope.resize = function(e,ui){
            /*debugger;*/
            console.log(ui.size);
            vm.documentTextStyle={'width': ui.size.width-30, 'max-height': ui.size.height-80>1000?1000:ui.size.height-80};
        };

        function toggleDocumentText(){
            vm.showDocumentText = !vm.showDocumentText;
            console.log(vm.documentTextStyle);
        }

        function copyText(){
            $(document).ready(function(){
                var textArea = document.createElement("textarea");

                textArea.style.position = 'fixed';
                textArea.style.top = 0;
                textArea.style.left = 0;

                // Ensure it has a small width and height. Setting to 1px / 1em
                // doesn't work as this gives a negative w/h on some browsers.
                textArea.style.width = '2em';
                textArea.style.height = '2em';

                // We don't need padding, reducing the size if it does flash render.
                textArea.style.padding = 0;

                // Clean up any borders.
                textArea.style.border = 'none';
                textArea.style.outline = 'none';
                textArea.style.boxShadow = 'none';

                textArea.value = vm.DocumentText;

                document.body.appendChild(textArea);

                textArea.select();

                try {
                    var successful = document.execCommand('copy');
                    var msg = successful ? 'successful' : 'unsuccessful';
                    console.log('Copying text command was ' + msg);
                } catch (err) {
                    console.log('Oops, unable to copy');
                }

                document.body.removeChild(textArea);
            });
}

        //isolated pusher related functionality into a seperate controller
        angular.extend(this, $controller('PusherDocEventHandler', {
            vm: vm
        }));

        //isolated pusher related functionality into a seperate controller
        angular.extend(this, $controller('DocumentPusherCtrl', {
            vm: vm
        }));
    }
})();
