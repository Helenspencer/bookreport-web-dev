(function () {
    'use strict';
    angular.module('app').controller('LibraryCtrl', LibraryCtrl);

    LibraryCtrl.$inject = [
    '$scope', '$location','FileDownloadSvc', 'SessionService', 'FileAuditSvc','$rootScope', 'LibrarySvc', '$timeout', '$filter', 'FileSvc', '$modal', 'dialogs', 'ENV', 'TagsSvc', 'FolderSvc', '$controller'
    ];

    function LibraryCtrl(
        $scope, $location,FileDownloadSvc, SessionService, FileAuditSvc,$rootScope, LibrarySvc, $timeout, $filter, FileSvc, $modal, dialogs, ENV, TagsSvc, FolderSvc, $controller) {
        var vm = this;
        vm.currentPage = 1;
        var queryParams = $location.search();
        if(queryParams.ps){
            vm.itemsPerPage = parseInt(queryParams.ps);
        } else{
            vm.itemsPerPage = 10;
        }

        vm.pageSizes = [10, 20, 50, 100];
        vm.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'shortDate'];
        vm.format = vm.formats[0];

        vm.dateOptions = {
            'year-format': 'yy',
            'starting-day': 1,
            'startDateOpened': false,
            'endDateOpened': false
        };
        vm.searchCriteria = {};
        vm.rootItem = {'Files': []};
        vm.editedRow = -1;
        vm.advanced = false;

        vm.openDt = openDt;
        vm.searchLibrary = searchLibrary;
        vm.pageChange = pageChange;
        vm.updateDownloadableProjects = updateDownloadableProjects;
        vm.updateDownloadableFiles = updateDownloadableFiles;
        vm.updateAllProjectsForDownload = updateAllProjectsForDownload;
        vm.orderList = orderList;
        vm.downloadFiles = downloadFiles;
        vm.showUploadFilesModal = showUploadFilesModal;
        vm.archiveFiles = archiveFiles;
        vm.restoreFiles = restoreFiles;
        vm.reProcess = reProcess;
        vm.setRootItem = setRootItem;
        vm.showFolderModal = showFolderModal;
        vm.showTagsModal = showTagsModal;
        vm.downloadFile = downloadFile;
        vm.updateTags = updateTags;
        vm.loadTags = loadTags;
        vm.listTags = listTags;
        vm.removeFile = removeFile;
        vm.previewOrDownloadFile = previewOrDownloadFile;
        vm.showTags = showTags;
        vm.details = details;
        vm.searchByItemID = searchByItemID;
        vm.searchAllFiles = searchAllFiles;
        vm.getTagsPlainArray = getTagsPlainArray;
        vm.getPagesArray = getPagesArray;
        vm.getNumPages = getNumPages;
        vm.switchPage = switchPage;
        vm.closeTagEditor = closeTagEditor;
        vm.editTags = editTags;
        vm.getChangedFilesCount=getChangedFilesCount;
        vm.filterByTag = filterByTag;
        vm.showFolderHistory = showFolderHistory;
        vm.fileDownload = fileDownload;
        vm.isDisable = true;
        vm.getDocumentAbstract = getDocumentAbstract;
        vm.exportFileNames = exportFileNames;

        vm.currentTotalItems=0;
        vm.changedFilesCount=0;
        vm.showItemFileCount = false;

        listTags();
        loadFolders();
        searchLibrary();

        $scope.$watch(function () {
            return vm.searchCriteria;
        }, function (nv, ov) {
            if (!angular.equals(nv,ov)) {
                searchLibrary();
            }
        }, true);

        function openDt($event, field) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.dateOptions[field] = true;
        }

        function showTags(file) {

            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'views/library/tags.html',
                controller: 'TagsCtrl as modal',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    file: function () {
                        return file;
                    }
                }
            });
            modalInstance.result.then(function () {
                searchLibrary();
            });
        }

        function loadFolders() {
            return FolderSvc.list().then(function (resp) {
                vm.folders = resp;
                return vm.folders;
            });
        }

        function showFolderHistory(entityId, type){
            var folderId, projectId;
            if(type === 0){
                folderId = entityId;
            }else if(type === 1){
                projectId = entityId;
            }
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'views/library/file_audit.html',
                controller: 'FileAuditCtrl as modal',
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    fileAudit: function () {
                        return {'folderId':folderId, 'projectId':projectId};
                    }
                }
            });
        }

        function setRootItem(value, force) {

            if (value === vm.rootItem && !force) {
                return;
            }

            vm.filesSelected = false;
            vm.paginatedList.forEach(function (project) {
                project.Selected = false;
                if (project.Files) {
                    project.Files.forEach(function (file) {
                        file.Selected = false;
                    });
                }
            });
            vm.rootItem = value;

            if (value) {
                vm.files = value.Files;
            }
            vm.currentPage = 1;

            orderList(vm.row || 'Name', true);
        }

        function searchAllFiles() {
            vm.showItemFileCount = false;
            vm.searchCriteria.FolderID = undefined;
            vm.searchCriteria.ProjectID = undefined;
            vm.rootItem = {'Type': 999};
            vm.currentPage = 1;
            /*vm.folderOrProjectSearch = false;*/
            searchLibrary();
        }

        function isFilterSearch(){
            return vm.filterSearch &&
            (vm.searchCriteria.Tag || vm.searchCriteria.Extension || (vm.searchCriteria.FileSize || vm.searchCriteria.FileSize===0));
        }

        function searchLibrary(isPusherEvent) {
            vm.list = [];
            vm.filesCount = 0;
            vm.totalItems = 0;
            vm.loading = true;
            vm.isLoading=true;
            vm.isPusherEvent=isPusherEvent || false;

            var criteria = {};

            console.log('vm.advanced: ', vm.advanced);
            console.log('isFilterSearch: ', isFilterSearch());

            if (vm.advanced || vm.folderOrProjectSearch || isFilterSearch()) {
                criteria = vm.searchCriteria;
            } else {
                criteria.basic = vm.searchCriteria.Project;
                criteria.folderId = vm.searchCriteria.FolderID;
                criteria.projectId = vm.searchCriteria.ProjectID;
            }

            criteria.PageSize = vm.itemsPerPage;
            criteria.CurrentPage = vm.currentPage;

            LibrarySvc.search(criteria).then(function (resp) {
                vm.isLoading=false;
                vm.loading = false;
                vm.lastUpdatedSearch = new Date().getTime();
                vm.searchResponse = resp;
                console.log('vm.searchResponse: ', vm.searchResponse);
                vm.searchResponse.ItemsByFileCount.forEach(function(item){
                    item.popOverContent = populatePopoverContent(item);
                });
                vm.totalSize = resp.TotalSize;
                vm.shortenTotalSize = $rootScope.formatBytes(vm.totalSize);
                vm.previousTotalItems = vm.currentTotalItems || 0;
                vm.currentTotalItems = resp.TotalFiles;
                if (vm.archivedFiles && vm.archivedFiles.length > 0) {
                    vm.showFileRestoreOption = true;
                } else {
                    vm.showFileRestoreOption = false;
                }

                listTags();
                fileDownload();
            });
        }

        function exportFileNames(){
            var criteria = {};

            if (vm.advanced || vm.folderOrProjectSearch || isFilterSearch()) {
                criteria = vm.searchCriteria;
            } else {
                criteria.basic = vm.searchCriteria.Project || undefined ;
                criteria.folderId = vm.searchCriteria.FolderID || undefined;
                criteria.projectId = vm.searchCriteria.ProjectID || undefined;
            }

            if(!criteria.Project){
                delete criteria.Project;
            }
            if(!criteria.Name){
                delete criteria.Name;
            }
            if(!criteria.Tag){
                delete criteria.Tag;
            }
            if(!criteria.Body){
                delete criteria.Body;
            }
            if(!criteria.basic){
                delete criteria.basic;
            }

            var params = undefined;
            for (var key in criteria){
                if(!params && criteria[key] !== undefined && key !== 'StartDate' && key !== 'EndDate'){
                    params = '&'+ key +'='+criteria[key];
                }else if(params && criteria[key] !== undefined && key !== 'StartDate' && key !== 'EndDate'){
                    params+= '&'+ key +'='+criteria[key];
                }
                if(key == 'StartDate' || key == 'EndDate'){
                    var value = criteria[key];
                    params+= '&'+key + '=' + criteria[key].getTime()/1000;
                }
            }

            window.open(ENV.apiEndpoint + '/search/export?token=' + encodeURIComponent(SessionService.getToken().value.split(' ')[1]) + params);
        }

        function getTotalSize(files) {
            var total = 0;
            angular.forEach(files, function (value) {
                total += value.Size;
            });
            return total;
        }


        function getShortentotalSize(value) {
            var mbValue = value / 1000000;

            if (mbValue > 1000) {
                return roundSize(mbValue / 1000) + ' GB';
            }

            if (mbValue > 1) {
                return roundSize(mbValue) + ' MB';
            }

            if (value > 1000) {
                return roundSize(value / 1000) + ' KB';
            }

            return value + ' bytes';
        }

        function roundSize(value) {
            return Math.round(value * 100) / 100;
        }

        function pageChange() {
            if (!vm.rootItem) {
                return;
            }
            searchLibrary();
        }

        function downloadFiles() {
            var fileIds = [];

            vm.searchResponse.Files.forEach(function (file) {
                if (file.Selected && fileIds.indexOf(file.EntityID) === -1) {
                    fileIds.push(file.EntityID);
                }
            });
            vm.isDisable = true;
            window.open(ENV.apiEndpoint + '/file/' + '?token=' + encodeURIComponent(SessionService.getToken().value.split(' ')[1]) + '&fileIds=' + fileIds.join(','));
        }

        function details(file) {
            $location.path('app/library/files/' + file.EntityID);
        }

        function updateDownloadableFiles(project, file, cb) {
            if (file.Selected) {
                vm.filesSelected = true;
            } else {
                vm.filesSelected = false;
            }
            if (project.Selected && !file.Selected) {
                project.Selected = false;
                project.Indeterminate = true;
                vm.filesSelected = true;
            }

            if (file.Selected && !project.Selected) {
                var allFilesSelected = true;
                vm.searchResponse.Files.forEach(function (item) {
                    if (!item.Selected) {
                        allFilesSelected = false;
                    } else {
                        vm.filesSelected = true;
                    }
                });

                if (allFilesSelected) {
                    project.Selected = true;
                    cb.indeterminate = false;
                } else {
                    cb.indeterminate = true;
                }
            }
            isCheckBoxClear();
        }

        function isCheckBoxClear(){
            vm.isDisable = true;
            vm.selectedFiles = [];
            vm.searchResponse.Files.forEach(function (file) {
                if (file.Selected) {
                    vm.selectedFiles.push(file);
                }
            });
            if(vm.selectedFiles && vm.selectedFiles.length > 0){
                vm.isDisable = false;
            }
        }

        function updateDownloadableProjects(project) {
            if (project.Selected) {
                vm.filesSelected = true;
            } else {
                vm.filesSelected = false;
            }

            vm.searchResponse.Files.forEach(function (file) {
                file.Selected = project.Selected;
            });
            isCheckBoxClear();
        }

        function updateAllProjectsForDownload() {
            vm.list.forEach(function (item) {
                if (vm.downloadAllProjects) {
                    item.Selected = true;
                    vm.filesSelected = true;
                } else {
                    item.Selected = false;
                    vm.filesSelected = false;
                }
                updateDownloadableProjects(item);
            });
        }

        function orderList(rowName, force) {
            vm.fileSizes = [{'Value': 0, 'minSize': 0, 'maxSize': 10, 'Count': 0}, {
                'Value': 1,
                'minSize': 10,
                'maxSize': 100,
                'Count': 0
            }, {'Value': 2, 'minSize': 100, 'maxSize': 1024, 'Count': 0}, {'Value': 3, 'minSize': 1024, 'Count': 0}];
            vm.fileTypes = [{'Value': 0, 'Type': 'doc', 'Count': 0}, {
                'Value': 1,
                'Type': 'docx',
                'Count': 0
            }, {'Value': 2, 'Type': 'txt', 'Count': 0}, {'Value': 3, 'Type': 'text', 'Count': 0}, {
                'Value': 4,
                'Type': 'pdf',
                'Count': 0
            }, {'Value': 5, 'Type': 'ppt', 'Count': 0}, {'Value': 6, 'Type': 'pptx', 'Count': 0}, {
                'Value': 7,
                'Type': 'xls',
                'Count': 0
            }, {'Value': 8, 'Type': 'xlsx', 'Count': 0}];
            if (vm.row === rowName && !force) {
                return;
            }
            vm.row = rowName;
            if (rowName === 'Tags' || rowName === '-Tags') {
                vm.rootItem.Files.forEach(function (file) {
                    if (rowName === '-Tags') {
                        file.Tags = $filter('orderBy')(file.Tags, '-');
                    } else {
                        file.Tags = $filter('orderBy')(file.Tags);
                    }
                });
            } else {
                vm.searchResponse.Files = $filter('orderBy')(vm.searchResponse.Files, rowName);
            }

            // pageChange(); // Because of this sorted result is overriding
        }

        function showUploadFilesModal(file) {
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'views/common/file-upload.html',
                controller: 'FileUploadCtrl as modal',
                backdrop: 'static',
                resolve: {
                    projectsAndFolders: function () {

                        return loadFolders();
                    },
                    selectedItem: function () {
                        return vm.rootItem;
                    },
                    fileToBeReplaced: function () {
                        return file || {};
                    }
                }
            });
            modalInstance.result.then(function () {

            });
        }

        function getSelectedFiles() {
            var files = [];

            vm.searchResponse.Files.forEach(function (file) {
                if (file.Selected) {
                    files.push(file);
                }
            });

            return files;
        }

        function archiveFiles(file) {
            var dlg;
            dlg = dialogs.confirm('Archive files', 'Confirm that you want to archive the selected files.');
            vm.isDisable = true;
            dlg.result.then(function () {
                vm.showFileRestoreOption = false;
                if (file) {
                    vm.archivedFiles = [angular.copy(file)];
                } else {
                    vm.archivedFiles = angular.copy(getSelectedFiles());
                }

                vm.loading = true;
                vm.archivedFiles.forEach(function (item, index) {
                    item.Archived = true;
                    if (item.Tags) {
                        item.Tags = processTags(item.Tags);
                    }
                    FileSvc.save(item).then(function () {
                        //search library to pull the files once all the selected files
                        //are archived.
                        if (index === vm.archivedFiles.length - 1) {
                            searchLibrary();
                        }
                    });
                });
            });
        }

        function reProcess(file) {
            var dlg;
            dlg = dialogs.confirm('Re-process', 'Confirm that you want to re-process the selected files.');
            dlg.result.then(function () {
                FileSvc.reProcess(file.EntityID).then(function () {
                    //todo : messaging / UI update upon a reprocess?
                });
            });
        }

        function removeFile(file) {
            var dlg;
            dlg = dialogs.confirm('', 'Confirm that you want to archive the selected files.');
            dlg.result.then(function () {
                FileSvc.remove(file.EntityID).then(function () {
                    searchLibrary();
                });
            });
        }

        function restoreFiles() {

            var dlg;
            dlg = dialogs.confirm('Restore files.', 'Confirm that you want to restore the recently archived files.');
            dlg.result.then(function () {
                vm.restoreFiles = angular.copy(vm.archivedFiles);
                vm.archivedFiles = [];

                vm.restoreFiles.forEach(function (item, index) {
                    item.Archived = false;
                    FileSvc.save(item).then(function () {
                        //search library to pull the files once all the selected files
                        //are restored.
                        if (index === vm.restoreFiles.length - 1) {
                            /*vm.filesSelected = [];*/
                            vm.restoreFiles = [];
                            searchLibrary();
                        }
                    });
                });
            });
        }

        function showFolderModal(folder, event) {
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'views/library/folder.html',
                controller: 'FolderCtrl as modal',
                resolve: {
                    folder: function () {
                        return folder ? angular.copy(folder) : {'Name': ''};
                    }
                }
            });
            modalInstance.result.then(function () {
                searchLibrary();
            });

            if(event){
                event.stopPropagation();
            }
        }

        function showTagsModal() {
            var modalInstance;
            modalInstance = $modal.open({
                templateUrl: 'views/library/tags.html',
                controller: 'TagsCtrl as modal',
                resolve: {
                    token: function(){
                        return  SessionService.getToken().value.split(' ')[1];
                    }
                }
            });
            modalInstance.result.then(function () {
                // searchLibrary();
            });
        }


        function downloadFile(file) {
            window.open(ENV.apiEndpoint + '/file/' + file.EntityID +'/?mode=download' + '&token=' + encodeURIComponent(SessionService.getToken().value.split(' ')[1]));
        }
        function fileDownload() {
            var userid =$rootScope.user.UserAccountID;

            FileDownloadSvc.get(userid).then(function (resp) {
                vm.downloadFilesByUser = resp;
                if(vm.downloadFilesByUser && vm.searchResponse){
                    vm.searchResponse.Files.forEach(function(file){
                        vm.downloadFilesByUser.forEach(function(item){
                            if(item.FileID === file.EntityID){
                                file.isdownloadedByUser = true;
                            }
                        });
                    });
                }
            });
        }

        function displayPdfInFlexPaper(file) {
            window.open('document-view.html?url=' + ENV.apiEndpoint + '&hasPreview=' + file.HasPreview +'&fileId=' + file.EntityID + '&token=' + encodeURIComponent(SessionService.getToken().value.split(' ')[1]) + '&name=' + file.Name);
        }

        function previewOrDownloadFile(file) {
            displayPdfInFlexPaper(file);
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

        function getTagsPlainArray(tags) {
            var res = [];

            angular.forEach(tags, function (value) {
                res.push(value.text || value);
            });

            return res;
        }

        function getNumPages() {
            if(!vm.searchCriteria.FolderID && !vm.searchCriteria.ProjectID){
                return Math.ceil(vm.searchResponse.TotalFiles / vm.itemsPerPage);
            }else{
                var count = 0;
                vm.searchResponse.ItemsByFileCount.forEach(function(item){
                    if(vm.searchCriteria.FolderID && item.EntityID === vm.searchCriteria.FolderID){
                        count =  Math.ceil(item.Count / vm.itemsPerPage);
                    }else if(vm.searchCriteria.ProjectID && item.EntityID === vm.searchCriteria.ProjectID){
                        count = Math.ceil(item.Count / vm.itemsPerPage);
                    }
                });
                return count;
            }
        }

        function getPagesArray() {
            return new Array(getNumPages());
        }

        function switchPage(value) {
            var page = Math.max(1, Math.min(getNumPages(), vm.currentPage + parseInt(value)));

            if (page !== vm.currentPage) {
                vm.currentPage = page;
                vm.pageChange();
            }
        }

        function closeTagEditor() {
            vm.editedRow = -1;
        }

        function editTags(index, event) {
            vm.editedRow = index;
            vm.currentTagsEditor = $(event.target).closest('td');
            event.stopPropagation();
            $(document).on('click', documentClick);
        }

        function documentClick(event) {
            if (!vm.currentTagsEditor.find('.tags-editor').has(event.target).length) {
                vm.editedRow = -1;
                $scope.$apply();
                $(document).off('click', documentClick);
            }
        }

        function updateTags(file) {
            if (file.Tags) {
                file.Tags = processTags(file.Tags);
                if ($rootScope.user.IsCedarwoodUser) {
                    file.PersonalTag = false;
                } else {
                    file.PersonalTag = true;
                }
            }

            FileSvc.save(file).then(function () {
                /*vm.folderOrProjectSearch = true;*/
                /*searchLibrary();*/
                listTags();
            });
        }

        function listTags() {
            var token = SessionService.getToken().value.split(' ')[1];
            TagsSvc.list(token, undefined, undefined,'org', undefined, undefined).then(function(tags){
                vm.Tags = tags;
            });
        }

        $scope.$watch(function () {
            return vm.selectedTag;
        }, function () {
            if (vm.selectedTag) {
                if (!vm.searchCriteria.Tag) {
                    vm.searchCriteria.Tag = '';
                }
                if (vm.searchCriteria.Tag.length > 0) {
                    vm.searchCriteria.Tag = vm.searchCriteria.Tag + ',' + vm.selectedTag;
                } else {
                    vm.searchCriteria.Tag += vm.selectedTag;
                }
            }
        }, true);

        $scope.$watch(function () {
            return vm.itemsPerPage;
        }, function (nv, ov) {
            if(ov && nv !== ov){
                vm.currentPage = 1;
                $location.search('ps',vm.itemsPerPage);
                pageChange();
            }
        });

        function loadTags(query) {
            var token = SessionService.getToken().value.split(' ')[1];
            return TagsSvc.list(token, query, $rootScope.user.IsCedarwoodUser?undefined:$rootScope.user.UserAccountID, $rootScope.user.IsCedarwoodUser?'org':'personal', undefined, undefined);
        }

        function searchByItemID(item) {
            /*vm.folderOrProjectSearch = true;*/
            vm.showItemFileCount = true;
            vm.rootItem = item;
            vm.currentPage = 1;
            if (item.Type === 0) {
                vm.searchCriteria.FolderID = item.EntityID;
                vm.searchCriteria.ProjectID = undefined;
            } else {
                vm.searchCriteria.FolderID = undefined;
                vm.searchCriteria.ProjectID = item.EntityID;
            }
            vm.totalFileCountByItem = item.Count;
            vm.totalFileSizeByItem = $rootScope.formatBytes(item.Size);
        }

        function getChangedFilesCount(){
            var count =0;

            count = vm.currentTotalItems-vm.previousTotalItems;

            if (count != 0){
                vm.changedFilesCount = count;
            } else{
                count = vm.changedFilesCount;
            }

            return (count>=0)?count: (-1*count);
        }

        function filterByTag(tag){
            if(vm.searchCriteria.Tag){
                vm.searchCriteria.Tag += ','+tag;
            } else{
                vm.searchCriteria.Tag = tag;
            }
        }

        function populatePopoverContent(item){
            var ulPrefix= "<ul class='list-group list-group-minimal'></ul>";
            var liPrefix = "<li class='list-group-item'>";
            var content = "";

            FileAuditSvc.list(item.Type==0?item.EntityID:undefined, item.Type==1?item.EntityID:undefined, undefined, 10).then(function(resp){
                if(resp && resp.length>0){
                    resp = $filter('orderBy')(resp, 'ChangedOn', '-');
                    resp.forEach(function(item){
                        content += liPrefix+getPopoverMessage(item)+'</li>';
                    });
                    item.popOverContent = '<ul class="list-group list-group-minimal">'+content+'</ul>';
                } else{
                    item.popOverContent = '<ul class="list-group list-group-minimal">'+liPrefix+'No history found.</li></ul>';
                }
            });
        }

        function getPopoverMessage(item){
            var msg = "";
            if(item.Action == 0 || item.Action == 1){
                msg = 'File "'+item.FileName+'" <span class="file-audit-action-name"> uploaded </span>'
            }

            if(item.Action == 2){
                msg = 'Folder <span class="file-audit-action-name">name changed</span> from "'+item.FolderName+'" to "'+item.NewFolderName+'"';
            }

            if(item.Action == 3){
                msg = 'File <span class="file-audit-action-name">name changed</span> from "'+item.FileName+'" to "'+item.NewFileName+'</span>';
            }

            return msg+' by <span class="file-audit-action-user-name">'+(item.ChangedByName || 'System')+'</span> <span style="font-size:small">'+moment(item.ChangedOn).fromNow()+'</span>';
        }

        function getDocumentAbstract(file){
            vm.fileId = file.EntityID;
            FileSvc.getFileDocument(vm.fileId).then(function (resp) {
                vm.Abstract = resp.Abstract;
                var popup = document.getElementById("myPopup");
                if(vm.Abstract && vm.Abstract.length>0 && popup){
                    popup.classList.toggle("show");
                }
            });
        }

        //isolated pusher related functionality into a seperate controller
        //angular.extend(this, $controller('LibraryPusherCtrl', {
         //   vm: vm
        //}));
    }
}).call(this);
