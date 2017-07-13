(function() {
	'use strict';
	angular.module('app').controller('DocumentRequestsCtrl', DocumentRequestsCtrl);

	DocumentRequestsCtrl.$inject = ['$stateParams', 'DocumentRequestSvc', 'ProjectSvc', '$rootScope', '$scope', 'SessionService', '$location', 'ENV', 'Upload', 'dialogs'];

	function DocumentRequestsCtrl($stateParams, DocumentRequestSvc, ProjectSvc, $rootScope, $scope, SessionService, $location, ENV, Upload, dialogs) {
		var vm = this;
		vm.addDocument=addDocument;
		vm.save=save;
		vm.removeDocument=removeDocument;
		vm.fulfillRequest=fulfillRequest;

		if(!$rootScope.user){
			SessionService.getUser().then(function(user) {
				loadDocumentRequests();
			});
		} else{
			loadDocumentRequests();
		}		

		function loadDocumentRequests() {
			var documentRequestId = $stateParams.id;
			vm.projectId = $stateParams.projectId;
			loadProject();
			if (documentRequestId) {
				if (documentRequestId !== 'new') {
					DocumentRequestSvc.get(documentRequestId).then(function(resp) {
						vm.documentRequest = resp;						
						if(vm.documentRequest.RequestedFromID === $rootScope.user.UserAccountID){
							vm.isClient=true;
						} else{
							addDocument();	
						}
					});
				} else {
					initializeDocument();
					addDocument();					
				}
			} else{
				debugger;
			}
		}

		function initializeDocument(){
			if(!vm.documentRequest){
				vm.documentRequest = {					
					'Documents':[],
					'ProjectID': vm.projectId
				}				
			}
			updateMessage();
			watchRequestedFrom();
		}

		function addDocument(doc){
			if(doc && !doc.Name){
				return;
			}

			vm.alerts= [];

			vm.documentRequest.Documents.forEach(function(item){
				item.NewRow=false;
			});

			vm.documentRequest.Documents.push({'NewRow': true});
			updateMessage();
		}

		function loadProject(){
			ProjectSvc.get(vm.projectId).then(function(resp){
				vm.project=resp;
				var members = [];
				vm.project.Members.forEach(function(item){
					if(item.Relation === 1){
						members.push(item);
					}
				});
				vm.project.Members = members;
			});
		}

		function watchRequestedFrom(){
			$scope.$watch(function(){
				return vm.documentRequest.RequestedFromID;
			}, function(nv,ov){
				
				if(nv && nv !== ov){
					vm.project.Members.forEach(function(item){
						if(vm.documentRequest.RequestedFromID === item.UserID){
							vm.documentRequest.RequestedFrom=item.DisplayName || item.Email;
							initializeDocument();							
						}
					});
				}
			});
		}

		function save(reloadPage, showUserNotifiedModal)	{
			var data = angular.copy(vm.documentRequest);			
			
			if(!vm.isClient && data.Status === 1){
				var dlg;
				dlg = dialogs.confirm('Complete request?', 'Confirm that all documents are received.');
				dlg.result.then(function() {
					data.CompleteRequest=true;
					processSave(data, reloadPage, showUserNotifiedModal);
				}, function(){					
					processSave(data, reloadPage, showUserNotifiedModal);
				});
			} else{
				processSave(data, reloadPage, showUserNotifiedModal);
			}
		}

		function processSave(data, reloadPage, showUserNotifiedModal){
			var docs = [];
			vm.alerts= [];
			data.Documents.forEach(function(item){
				delete item.NewRow;
				if(item.Name){
					docs.push(item);
				}
			});
			data.Documents = docs;
			if(!data.Documents || data.Documents.length <= 0){
				vm.alerts=[{'type': 'danger', 'msg': 'Please provide atleast one document.'}]
			} else{
				updateMessage(data);
				DocumentRequestSvc.save(data).then(function(resp){
					if(reloadPage){
						loadDocumentRequests();
					} else{
						if(showUserNotifiedModal){
							var dlg = dialogs.notify('Requester notified', 'Requester notified about the document request fulfillment.');
							dlg.result.then(function(){
								$location.path('/app/projects/'+vm.projectId);	
							});
						} else{
							$location.path('/app/projects/'+vm.projectId);
						}						
					}
					
				});
			}
		}

		function fulfillRequest(){
			if(vm.documentRequest.Status != 2){
				vm.documentRequest.IsFulfillingRequest=true;
				var dlg;
				dlg = dialogs.confirm('Fulfill request?', 'Confirm that you have attached all the files requested.');
				dlg.result.then(function() {
					save(false, true);
				}, function(){
					var dlg2 = dialogs.notify('Fulfill later', 'You can come back to this page and attach the remaining files when available.');
					dlg2.result.then(function() {
						$location.path('/app/projects/'+vm.projectId);	
					});
				});	
			} else{
				$location.path('/app/projects/'+vm.projectId);	
			}			
		}

		function removeDocument(index){
			vm.documentRequest.Documents.splice(index,1);
			updateMessage();
		}

		function getDocumentNames(){
			var documents='';
			if(vm.documentRequest.Documents){
				vm.documentRequest.Documents.forEach(function(item){
					if(item.Name){
						documents += '\n\t'+item.Name
					}					
				});
			}	
			
			return documents;		
		}

		function updateMessage(documentRequest){
			if(documentRequest){
				documentRequest.Message = 'Hello '
				+(documentRequest.RequestedFrom||'')
				+', \n\n Please provide the documents listed below:\n'+getDocumentNames()
				+'\n\n Please use the following link to upload the requested files:\n\n<a href="REQUEST_URL">Upload files</a>'
				+'\n\n Kind regards,\n ' + $rootScope.user.DisplayName;		
			} else{
				vm.documentRequest.Message = 'Hello '+(vm.documentRequest.RequestedFrom||'')+', \n\n Please provide the documents listed below:\n'+getDocumentNames()+'\n\n Kind regards,\n ' + $rootScope.user.DisplayName;		
			}			
		}

		$scope.uploadFile = function (file, index) {				
			file.uploading=true;
			Upload.upload({
				url: ENV.apiEndpoint+'/file/?folderId=""&tags=""&projectId='+vm.projectId,				
				file: file,
				headers: {'Authorization': SessionService.getToken().value}
			}).then(function (resp) {
				console.log('Uploaded success. Response: ' + resp);
				file.uploading=false;
				console.log(vm.documentRequest);
				vm.documentRequest.Documents[index].FileID = resp.data.EntityID;
				vm.documentRequest.Documents[index].FileName = resp.data.Name;
				save(true);
			}, function (resp) {
				console.log('Error status: ' + resp.status);
			}, function (evt) {
				var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				file.progressPercentage=progressPercentage;
				console.log('progress: ', progressPercentage);
			});
		};
	}
})();