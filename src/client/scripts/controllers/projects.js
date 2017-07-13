(function() {
  'use strict';
  angular.module('app').controller('ProjectsCtrl', ProjectsCtrl);

  ProjectsCtrl.$inject = [
  '$scope', '$location', '$stateParams', 'ProjectSvc', 'dialogs', 'EngagementsSvc', '$modal', 'ENV', 'SessionService', 'TagsSvc', 'FileSvc', '$filter', 'FundSvc', 'LibrarySvc', 'MilestonesSvc', '$rootScope', 'DocumentRequestSvc', '$controller', 'FileDownloadSvc'
  ];

  function ProjectsCtrl($scope, $location, $stateParams, ProjectSvc, dialogs, EngagementsSvc, $modal, ENV, SessionService, TagsSvc, FileSvc, $filter, FundSvc,LibrarySvc, MilestonesSvc, $rootScope, DocumentRequestSvc, $controller, FileDownloadSvc) {

    var original, vm = this;
    var projectId = $stateParams.id;
    loadEngagements();
    loadProjectTags();

    vm.currentPage = 1;
    vm.itemsPerPage = 10;
    vm.pageSizes=[10,20,50,100];
    vm.rootItem = {'Files': []};
    vm.advanced = false;
    vm.searchCriteria = {};

    var queryParams = $location.search();
    if(queryParams.ps){
      vm.itemsPerPage = parseInt(queryParams.ps);
    } else{
      vm.itemsPerPage = 10;
    }

    vm.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'shortDate'];
    vm.format = vm.formats[0];
    vm.isOgranizationAdmin = isOgranizationAdmin;

    vm.dateOptions = {
      'year-format': 'yy',
      'starting-day': 1,
      'startDateOpened': false,
      'endDateOpened': false
    };

    vm.getProjects = getProjects;
    vm.canRevert = canRevert;
    vm.canSubmit = canSubmit;
    vm.isCreate = isCreate;
    vm.updateProject = updateProject;
    vm.save = save;
    vm.edit = edit;
    vm.removeProject = removeProject;
    vm.showProjectInvitationModal = showProjectInvitationModal;
    vm.removeProject = removeProject;
    vm.showUploadFilesModal=showUploadFilesModal;
    vm.downloadFile=downloadFile;
    vm.updateTags = updateTags;
    vm.loadTags = loadTags;
    vm.showTags=showTags;
    vm.orderList=orderList;
    vm.updateDownloadableFiles=updateDownloadableFiles;
    vm.updateDownloadableProjects=updateDownloadableProjects;
    vm.downloadFiles=downloadFiles;
    vm.archiveFiles = archiveFiles;
    vm.getEngagementName=getEngagementName;
    vm. details= details;
    vm.previewOrDownloadFile=previewOrDownloadFile;
    vm.pageChange=pageChange;
    vm.removeMilestone=removeMilestone;
    vm.openDate = openDate;
    vm.project = {'StartDate': new Date()};
    vm.searchLibrary=searchLibrary;
    vm.filterByTag = filterByTag;
    vm.closeAlert = closeAlert;
    vm.createProject = createProject;
    vm.fileDownload = fileDownload;
    vm.loadProject = loadProject;
    vm.loadOrgTags = loadOrgTags;
    vm.loadProjectTags = loadProjectTags;

    vm.searchCriteria = {'ProjectID': projectId, 'PageSize': vm.itemsPerPage, 'CurrentPage': vm.currentPage};

    vm.accordionItems = [
    {'name': 'Files', 'templateUrl': 'views/projects/project-files.html', 'isOpen': true},
    {'name': 'Document Requests', 'templateUrl': 'views/projects/document-requests/list.html', 'isOpen': true}
    ];

    vm.dateOptions = {
      'year-format': 'yy',
      'starting-day': 1,
      'startDateOpened': false
    };

    vm.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'shortDate'];

    if(!$rootScope.user){
      SessionService.getUser().then(function(user) {
        $rootScope.user = user;
        loadOrgTags();
      });
    } else{
      loadOrgTags();
    }

    $scope.$watch(function(){
      return vm.project.EngagementID;
    }, function(nv, ov){
      if(nv !== ov){
        populateSchedules();
      }
    });

    if($rootScope.user && $rootScope.user.isClient === undefined){
      vm.accordionItems.push({'name': 'Milestones', 'templateUrl': 'views/projects/milestones/list.html', 'isOpen': true});
    }

    function isOgranizationAdmin(permission){
      var value = false;

      if (permission === 'Organization Admin') {
        value = true;
      }

      return value;
    }

    function createProject(){
      if(vm.engagements && vm.engagements.length>0){
        $location.path('app/projects/'+'new');
      }else{
        vm.noEngagementMessage = [{'msg': 'No engagements exist to associate the project you want to create. ', 'type':'info'}];
      }
    }

    function populateSchedules(){
      if(vm.engagements){
        vm.engagements.forEach(function(item){
          if(item.EntityID === vm.project.EngagementID){
            vm.engagementSchedules = item.Schedules.split(',');
          }
        });
      }
    }

    function loadOrgTags(){
      var token = SessionService.getToken().value.split(' ')[1];
      TagsSvc.list(token, undefined, $rootScope.user.IsCedarwoodUser? undefined : $rootScope.user.UserAccountID, 'org').then(function(resp){
        vm.tags = resp;
        getProjects();
      });
    }

    function openDate($event, field) {
      $event.preventDefault();
      $event.stopPropagation();
      vm.dateOptions[field] = true;
    }

    $scope.$watch(function () {
      return vm.searchCriteria;
    }, function (nv, ov) {
      if(!angular.equals(nv,ov)){
        searchLibrary();
      }
    }, true);

    function isFilterSearch(){
      return vm.filterSearch && (vm.searchCriteria.Tag || vm.searchCriteria.Extension || (vm.searchCriteria.FileSize || vm.searchCriteria.FileSize==0));
    }

    function searchLibrary(isPusherEvent){
      vm.isPusherEvent=isPusherEvent || false;
      vm.isLoading=true;

      var criteria = {};

      if (vm.advanced || isFilterSearch() ) {
        criteria = vm.searchCriteria;
      } else {
        criteria.basic = vm.searchCriteria.Project;
        criteria.projectId = vm.searchCriteria.ProjectID;
      }

      criteria.PageSize = vm.itemsPerPage;
      criteria.CurrentPage = vm.currentPage;

      LibrarySvc.search(criteria, true).then(function(resp) {
        vm.searchResponse = resp;

        if(vm.searchResponse.Files){
          vm.isLoading = false;
          vm.searchResponse.Files.forEach(function(item){
            var tags = [];

            if(vm.tags){
              vm.tags.forEach(function(tag){
                if(item.Tags && item.Tags.indexOf(tag)!==-1){
                  tags.push(tag);
                }
              });
            }

            item.editableTags=tags;
          });
          fileDownload();
        }
      });
    }

    function loadEngagements(){
      EngagementsSvc.list().then(function(resp) {
        vm.engagements = resp;
        if (projectId === 'new'){
          if(vm.engagements.length>0){
            vm.project.EngagementID = vm.engagements[0].EntityID;
          }
        } else{
          populateSchedules();
        }
      });
    }

    function loadProject(){
      ProjectSvc.get(projectId).then(function(resp) {
        vm.project = resp;
        orderList(vm.row || 'Name', true);
        loadFunds();
        loadMilestones();
        loadDocumentRequests();
      });
    }

    function loadProjects() {
      if (projectId) {
        loadProjectTypes();
        searchLibrary();
        loadEngagements();

        if (projectId !== 'new') {
          loadProject();
        }
      } else {
        ProjectSvc.list().then(function(resp) {
          vm.projects = resp;
        });
      }
    }

    function loadMilestones(){
      MilestonesSvc.list(vm.project.EntityID).then(function(resp) {
        vm.milestones = resp;
      });
    }

    function loadDocumentRequests(){
      DocumentRequestSvc.list(vm.project.EntityID).then(function(resp) {
        vm.documentRequests = resp;
        vm.documentRequests.forEach(function(documentRequest){
          if(documentRequest.RequestedFromID === $rootScope.user.UserAccountID){
            documentRequest.isClient=true;
          }
        });
      });
    }

    function loadFunds(){
      FundSvc.getFunds(vm.project.EntityID).then(function(resp){
        vm.funds = resp;
      });
    }

    function getProjects() {
      loadProjects();
    }

    function details(file)
    {
      $location.path('app/library/files/'+file.EntityID);
    }

    original = angular.copy(vm.project);
    function canRevert() {
      return !angular.equals(vm.project, original) || !vm.projectForm.$pristine;
    }

    function canSubmit() {
      return vm.projectForm && vm.projectForm.$valid && !angular.equals(vm.project, original);
    }

    function isCreate() {
      if (vm.project.EntityID) {
        return false;
      } else {
        return true;
      }
    }

    function updateProject(project) {
      ProjectSvc.update(project).then(function() {
        return getProjects();
      });
    }

    function showProjectInvitationModal() {
      var modalInstance;
      modalInstance = $modal.open({
        templateUrl: 'views/projects/project-invitation.html',
        controller: 'InviteProjectCtrl as modal',
        size: 'lg',
        resolve: {
          project: function() {
            return vm.selectedProject ? vm.selectedProject : vm.project;
          }
        }
      });
      modalInstance.result.then(function() {
        getProjects();
      });
    }

    function save() {
      vm.saving = true;
      ProjectSvc.save(vm.project).then(function(resp) {
        vm.saving = false;
        if (isCreate()) {
          return $location.path('/app/projects/'+resp.EntityID);
        } else {
          $location.path('/app/projects');
        }
      },function error(resp){
        if(resp.data && resp.data.errorCode && resp.data.errorCode === 700){
          vm.projectAlerts=[{'msg': vm.project.Name+' is already existed!', 'type':'danger'}];
        }
      });
    }

    function closeAlert(index){
      if(vm.projectAlerts){
        vm.projectAlerts.splice(index, 1);
      }else if(vm.noEngagementMessage){
        vm.noEngagementMessage.splice(index, 1);
      }
    }

    function edit(project) {
      return $location.path('/app/projects/' + project.EntityID);
    }

    function removeProject() {
      var dlg;
      dlg = dialogs.confirm('Remove "' + vm.selectedProject.Name + '"?', '');
      dlg.result.then(function() {
        ProjectSvc.remove(vm.selectedProject.EntityID).then(function() {
          getProjects();
        });
      });
    }

    function showUploadFilesModal() {
      var modalInstance;
      modalInstance = $modal.open({
        templateUrl: 'views/common/file-upload.html',
        controller: 'FileUploadCtrl as modal',
        backdrop: 'static',
        resolve: {
          projectsAndFolders: function() {
            return [vm.project];
          },
          selectedItem: function() {
            return vm.project;
          },
          fileToBeReplaced: function() {
            return  {};
          }
        }
      });
      modalInstance.result.then(function() {

      });
    }

    function archiveFiles(file) {
      var dlg;
      dlg = dialogs.confirm('Archive files', 'Confirm that you want to archive the selected files.');
      dlg.result.then(function() {
        vm.showFileRestoreOption = false;
        if(file)
        {
          vm.archivedFiles=[angular.copy(file)];
        }else
        {
          vm.archivedFiles= angular.copy(getSelectedFiles());
        }

        vm.archivedFiles.forEach(function(item, index) {
          item.Archived = true;
          if (item.Tags) {
            item.Tags = processTags(item.Tags);
          }
          FileSvc.save(item).then(function() {
            /**
            search library to pull the files once all the selected files
            are archived.
            **/
            if (index === vm.archivedFiles.length - 1) {
              loadProjects();
            }
          });
        });
      });
    }

    function downloadFile(file) {
      window.open(ENV.apiEndpoint + '/file/' + file.EntityID +'/?mode=download'+'&token=' + encodeURIComponent(SessionService.getToken().value.split(' ')[1]));
    }

    function displayPdfInFlexPaper(file){
      window.open('document-view.html?url='+ENV.apiEndpoint +'&hasPreview='+file.HasPreview +'&fileId='+file.EntityID+'&token=' + encodeURIComponent(SessionService.getToken().value.split(' ')[1])+'&name='+file.Name);
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

    function previewOrDownloadFile(file){
      displayPdfInFlexPaper(file);
    }


    function showTags() {
      var modalInstance;
      modalInstance = $modal.open({
        templateUrl: 'views/library/tags.html',
        controller: 'TagsCtrl as modal',
        size: 'lg',
        backdrop: 'static',
        resolve: {

        }
      });
      modalInstance.result.then(function() {
        loadProjects();
      });
    }

    function processTags(tags) {
      var stringTags = [];

      if (tags) {
        tags.forEach(function(tag) {
          stringTags.push(tag.text || tag);
        });
      }

      return stringTags;
    }

    function updateTags(file) {
      if (file.Tags) {
        file.Tags = processTags(file.Tags);
        if($rootScope.user.IsCedarwoodUser){
          file.PersonalTag = false;
        } else{
          file.PersonalTag = true;
        }
      }

      FileSvc.save(file).then(function() {
        loadOrgTags();
      });
    }

    function loadTags(query) {
      //Fetch perosnal tags only if user is not cedarwood user
      var token = SessionService.getToken().value.split(' ')[1];
      return TagsSvc.list(token, query, $rootScope.user.IsCedarwoodUser?undefined:$rootScope.user.UserAccountID, $rootScope.user.IsCedarwoodUser?'org':'personal', undefined, undefined);
    }

    function orderList(rowName, force) {
      if (vm.row === rowName && !force) {
        return;
      }
      vm.row = rowName;
      if (rowName === 'Tags' || rowName === '-Tags') {
        vm.project.Files.forEach(function(file) {
          if (rowName === '-Tags') {
            file.Tags = $filter('orderBy')(file.Tags, '-');
          } else {
            file.Tags = $filter('orderBy')(file.Tags);
          }
        });
      } else if(vm.searchResponse){
        vm.searchResponse.Files = $filter('orderBy')(vm.searchResponse.Files, rowName);
      }
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
        project.Files.forEach(function(item) {
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
    }

    function updateDownloadableProjects(project) {
      if (project.Selected) {
        vm.filesSelected = true;
      } else {
        vm.filesSelected = false;
      }

      project.Files.forEach(function(file) {
        file.Selected = project.Selected;
      });
    }

    function downloadFiles() {
      var fileIds = [];

      vm.searchResponse.Files.forEach(function(file) {
        if (file.Selected && fileIds.indexOf(file.EntityID) === -1) {
          fileIds.push(file.EntityID);
        }
      });

      window.open(ENV.apiEndpoint + '/file/' + '?token=' + encodeURIComponent(SessionService.getToken().value.split(' ')[1]) + '&fileIds=' + fileIds.join(','));
    }

    function getSelectedFiles() {
      var files = [];

      if (vm.project.EntityID) {
        vm.searchResponse.Files.forEach(function(file) {
          if (file.Selected) {
            files.push(file);
          }
        });
      }

      return files;
    }

    function pageChange() {
      if(!vm.rootItem){
        return;
      }

      loadProjects();
    }

    $scope.$watch(function(){
      return vm.itemsPerPage;
    }, function(){
      vm.currentPage=1;
      pageChange();
    });

    function getEngagementName(engId){
      var name;
      if(vm.engagements){
        vm.engagements.forEach(function(item){
          if(item.EntityID === engId){
            name = item.Name;
          }
        });

      }

      return name;
    }

    function removeMilestone(){
      var dlg;
      dlg = dialogs.confirm('Remove "' + vm.selectedMilestone.Name + '"?', '');
      dlg.result.then(function() {
        MilestonesSvc.remove(vm.selectedMilestone.ProjectID, vm.selectedMilestone.EntityID).then(function() {
          loadMilestones();
        });
      });
    }

    $scope.milestonesSortableOptions = {
      stop: function() {
        var milestoneIds = [];
        vm.milestones.forEach(function(item, index){
          item.Ordinal = index+1;
          milestoneIds.push(item.EntityID);
        });
        MilestonesSvc.updateOrdinals(projectId, milestoneIds).then(function(){
          loadMilestones();
        });
      }
    };

    function loadProjectTypes(){
      ProjectSvc.getTypes().then(function(resp){
        vm.projectTypes = resp;
        if (projectId === 'new'){
          if(vm.projectTypes.length>0){
            vm.project.ProjectTypeID = vm.projectTypes[0].EntityID;
          }
        }
      });
    }

    function filterByTag(tag){
      if(vm.searchCriteria.Tag){
        vm.searchCriteria.Tag += ','+tag;
      } else{
        vm.searchCriteria.Tag = tag;
      }
    }

    function loadProjectTags(){
      var data = {};
      data.ProjectID = projectId
      vm.projectTags = undefined;

      LibrarySvc.search(data, true, true).then(function(resp) {
        if(resp.data.Tags.length>0){
          vm.projectTags = resp.data.Tags;
        }
      });
    }

    //isolated pusher related functionality into a seperate controller
    //angular.extend(this, $controller('ProjectsPusherCtrl', {
    //  vm: vm
    //}));
  }
}).call(this);
