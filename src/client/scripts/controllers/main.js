'use strict';
angular.module('app').controller('MainCtrl', 
	['$scope', '$rootScope', '$location', '$layout', '$layoutToggles', '$pageLoadingBar', 'Fullscreen', 'SessionService', '$modal', 'OrganizationsSvc', 'AppConfig', '$window', '$timeout', 'FileSvc', 'TagsSvc', '$interval','Upload', 'ENV','$state', 'WorkerService', '$log', 'dialogs', '$controller',
	function($scope, $rootScope, $location, $layout, $layoutToggles, $pageLoadingBar, Fullscreen, SessionService, $modal, OrganizationsSvc, AppConfig, $window, $timeout, FileSvc, TagsSvc, $interval, Upload, ENV, $state, WorkerService, $log, dialogs, $controller) {
		var errorHandler, logoutHandler, uploadStartIndex=0, uploadsInProgress=0, MAX_PARALLEL_UPLOADS=3;

		logoutHandler = function() {
			$rootScope.data = {'organizationEvents':[], 'unReadCount': 0};
			cleanUpFileUploadStatus();
			$rootScope.$broadcast("logout");
			$location.path('/login');
		};
		errorHandler = function(err) {
			$scope.message = 'Error! ' + err.data.error;
		};

		$rootScope.isLoginPage = false;
		$rootScope.isLightLoginPage = false;
		$rootScope.isLockscreenPage = false;
		$rootScope.isMainPage = true;
		$rootScope.data = {'organizationEvents':[], 'unReadCount': 0, 
		'notificationIcons': {"file_added": "fa-file", "file_archived": "fa-minus"}, 
		"notificationTypes":{"file_added":"success", "file_archived": "warning"}};

		$rootScope.layoutOptions = {
			horizontalMenu: {
				isVisible: false,
				isFixed: true,
				minimal: false,
				clickToExpand: false,

				isMenuOpenMobile: false
			},
			sidebar: {
				isVisible: true,
				isCollapsed: false,
				toggleOthers: true,
				isFixed: true,
				isRight: false,

				isMenuOpenMobile: false,

			// Added in v1.3
			userProfile: true
		},
		chat: {
			isOpen: false,
		},
		settingsPane: {
			isOpen: false,
			useAnimation: true
		},
		container: {
			isBoxed: false
		},
		skins: {
			sidebarMenu: '',
			horizontalMenu: '',
			userInfoNavbar: ''
		},
		pageTitles: true,
		userInfoNavVisible: false
	};

	$layout.loadOptionsFromCookies(); // remove this line if you don't want to support cookies that remember layout changes


	$scope.updatePsScrollbars = function() {
		var $scrollbars = jQuery(".ps-scrollbar:visible");

		$scrollbars.each(function(i, el) {
			if (typeof jQuery(el).data('perfectScrollbar') == 'undefined') {
				jQuery(el).perfectScrollbar();
			} else {
				jQuery(el).perfectScrollbar('update');
			}
		})
	};


	// Define Public Vars
	public_vars.$body = jQuery("body");


	// Init Layout Toggles
	$layoutToggles.initToggles();


	// Other methods
	$scope.setFocusOnSearchField = function() {
		public_vars.$body.find('.search-form input[name="s"]').focus();

		setTimeout(function() {
			public_vars.$body.find('.search-form input[name="s"]').focus()
		}, 100);
	};


	// Watch changes to replace checkboxes
	$scope.$watch(function() {
		cbr_replace();
	});

	// Watch sidebar status to remove the psScrollbar
	$rootScope.$watch('layoutOptions.sidebar.isCollapsed', function(newValue, oldValue) {
		if (newValue != oldValue) {
			if (newValue == true) {
				public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar('destroy')
			} else {
				public_vars.$sidebarMenu.find('.sidebar-menu-inner').perfectScrollbar({
					wheelPropagation: public_vars.wheelPropagation
				});
			}
		}
	});


	// Page Loading Progress (remove/comment this line to disable it)
	$pageLoadingBar.init();

	$scope.showLoadingBar = showLoadingBar;
	$scope.hideLoadingBar = hideLoadingBar;


	// Set Scroll to 0 When page is changed
	$rootScope.$on('$stateChangeStart', function() {
		var obj = {
			pos: jQuery(window).scrollTop()
		};

		TweenLite.to(obj, .25, {
			pos: 0,
			ease: Power4.easeOut,
			onUpdate: function() {
				$(window).scrollTop(obj.pos);
			}
		});
	});


	// Full screen feature added in v1.3
	$scope.isFullscreenSupported = Fullscreen.isSupported();
	$scope.isFullscreen = Fullscreen.isEnabled() ? true : false;

	$scope.goFullscreen = function() {
		if (Fullscreen.isEnabled())
			Fullscreen.cancel();
		else
			Fullscreen.all();

		$scope.isFullscreen = Fullscreen.isEnabled() ? true : false;
	};

	$scope.logout = function() {
		if ($rootScope.filesToBeUploaded && $rootScope.filesToBeUploaded.length>0){
			var dlg;
			dlg = dialogs.confirm('Logout from the current session cancels the file uploads in progress.Do you still want to continue ' + '"?', '');
			dlg.result.then(function() {
				SessionService.logout({}, logoutHandler, errorHandler);
			});
		} else{
			SessionService.logout({}, logoutHandler, errorHandler);
		}	
	};

	function isDataCaptured(){		
		return $scope.user.CapturedUserDataOnLogin && $scope.user.CapturedUserDataOnLogin[$scope.user.CurrentOrganization.OrganizationID];
	}

	$scope.getUser = function() {
		SessionService.getUser(true).then(function(user) {
			$rootScope.user = user;
			getOrganizations();
			$rootScope.$broadcast('userLoaded');
			if(user.ChangePasswordOnLogin){
				$scope.changePassword();
			} else if(!isDataCaptured()){
				$scope.updateDetails();
			}
		});
	};
	$scope.getUser();
	$scope.$on('getUser', function() {
		$scope.getUser();
	});

	$scope.profile = function() {
		var modalInstance;
		modalInstance = $modal.open({
			templateUrl: 'views/profile.html',
			controller: 'ProfileCtrl',
			backdrop: 'static',
			size: 'lg',
			resolve: {
				profile: function() {
					return $scope.user;
				},
				isDataCapture: function (){
					return true;
				}
			}
		});
		modalInstance.result.then(function(user) {
			SessionService.updateProfile(user).then(function() {
				$scope.getUser();
			});
		});
	};

	$scope.changePassword = function() {
		var modalInstance;
		modalInstance = $modal.open({
			templateUrl: 'views/change-password.html',
			controller: 'ChangePasswordCtrl',
			size: 'lg',
			backdrop: 'static',
			resolve: {
				profile: function() {
					return $scope.user;
				}
			}
		});
		modalInstance.result.then(function(data) {
			if(!isDataCaptured()){
				$scope.updateDetails();
			}
		}, function(){						
			if(!isDataCaptured()){
				$scope.updateDetails();
			}
		});
	};


	$scope.updateDetails = function() {
		var modalInstance;
		modalInstance = $modal.open({
			templateUrl: 'views/update-details.html',
			controller: 'ProfileCtrl',
			backdrop: 'static',
			size: 'lg',
			resolve: {
				profile: function() {
					return $scope.user;
				},
				isDataCapture: function (){
					return true;
				}
			}
		});
		modalInstance.result.then(function(user) {
			user.CapturedUserDataOnLogin[user.CurrentOrganization.OrganizationID]=true;
			SessionService.updateProfile(user).then(function() {
				if (user.OrganizationName !== user.CurrentOrganization.Name){
					updateOrganizationName(user.CurrentOrganization.OrganizationID, user.OrganizationName);
				} else{
					$scope.getUser();
				}				
			});
		});
	};

	function updateOrganizationName(id, name){
		OrganizationsSvc.save({"EntityID": id, "Name": name}).then(function(organization){    		
			$timeout(function(){$window.location.reload()},0);
		});
	}

	function getOrganizations() {
		OrganizationsSvc.list().then(function(resp) {
			$rootScope.organizations = resp;
		});
	};

	$scope.changeOrganization = function(organization) {
		$scope.user.LastViewedOrganizationID = organization.EntityID;
		SessionService.updateProfile($scope.user).then(function(resp) {			
			$timeout(function(){$window.location.reload()},0);
		});
	};

	$scope.getPermissionDisplayName = function(permission) {
		var name;

		AppConfig.permissions.forEach(function(item) {
			if (item.key === permission) {
				name = item.value;
			}
		});

		return name;
	};

	$scope.hasPermission = function(item){				
		if($rootScope.user){
 			return ($rootScope.user.IsCedarwoodUser && item.title === 'Library') || (!$rootScope.user.IsCedarwoodUser && item.title === 'Projects') || ($rootScope.user && !$rootScope.user.CurrentOrganization.IsPersonal && $rootScope.user.IsCedarwoodUser);	 
  		} else{
  			return item.title === 'Library';	
  		}	
		
	}

	$rootScope.$on('fileUpload', function(context,flattenZip, tags){		
		$log.debug('files.length: ', $rootScope.filesToBeUploaded.length);
		$rootScope.filesUploadInProgress = true;
		$rootScope.uploadStartTime = moment();
		$rootScope.fileUploadAlerts=[];      
		$rootScope.fileProgressArray=[];      
		$rootScope.aggregateFilesProgress=0;		
		$rootScope.intervalTimer = setupProgressTrackingTimer();
		uploadFiles(undefined,flattenZip, tags);
	});

	function populateEstimatedTime(){
		var aggregateFilesProgress = 0;

		$rootScope.fileProgressArray.forEach(function(progress){
			aggregateFilesProgress += progress;
		});

		var elapsedSecondsSinceFileUpload = moment().diff($rootScope.uploadStartTime,'seconds');
		var averageFileProgressPerSecond = aggregateFilesProgress/elapsedSecondsSinceFileUpload;
		var timeRemainingVal = ($rootScope.getTotalFilesSize()-aggregateFilesProgress)/averageFileProgressPerSecond;
		$rootScope.timeRemaining = parseInt(timeRemainingVal<=0?0:timeRemainingVal);      
	}

	$rootScope.formatTime = function(timeVal){      
		var hours   = Math.floor(timeVal / 3600);
		var minutes = Math.floor((timeVal - (hours * 3600)) / 60);
		var seconds = timeVal - (hours * 3600) - (minutes * 60);

		if (hours   < 10) {hours   = '0'+hours;}
		if (minutes < 10) {minutes = '0'+minutes;}
		if (seconds < 10) {seconds = '0'+seconds;}
		var time    = hours+':'+minutes+':'+seconds;
		return time;
	}

	$scope.saveLibraryItem = function() {      
		uploadFiles();
	}

	function getSelectedItem(type) {		
		var result = null;
		$rootScope.projectsAndFolders.forEach(function(item) {        
			if (item.EntityID === $rootScope.selectedItem.EntityID) {          
				if (item.Type === type) {
					result = $rootScope.selectedItem.EntityID;
				}
			}
		});

		return result;
	}

	$scope.loadTags = function() {
		var token = SessionService.getToken().value.split(' ')[1];
		return TagsSvc.list(token, undefined, undefined, undefined, undefined, undefined);
	}	

	$rootScope.getTotalFilesSize = function(){
		var size=0;
		$rootScope.filesToBeUploaded.forEach(function(item){
			size += item.size;
		});

		return size;
	}

	$rootScope.formatBytes = function(bytes,decimals) {
		if(bytes === 0){
			return '0 Byte';
		}
		var k = 1000;
		var dm = decimals + 1 || 3;
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		var i = Math.floor(Math.log(bytes) / Math.log(k));
		return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
	}

	$window.onbeforeunload = function (e) {
		if ($rootScope.filesToBeUploaded && $rootScope.filesToBeUploaded.length>0){
			return "Closing the window cancels the file uploads in progress. Do you still want to continue?";
		}     
	}

	function processTags(tags) {
		var stringTags = [];

		if(tags){
			tags.forEach(function(tag) {
				stringTags.push(tag.text);
			});
		}     

		return stringTags;
	}	

	function setupProgressTrackingTimer(){
		var intervalTimer = $interval(function(){
			$log.info('timer invoked...', new Date());    
			
			$rootScope.timerRunning = true;			          
			populateEstimatedTime();
		}, 1000);

		return intervalTimer;
	}	

	function uploadFiles(files, flattenZip, tags) {
		$log.debug('Upload files...');				      

		if (files) {
			$rootScope.filesToBeUploaded = files;
		}

		$rootScope.filesProgress = [];		
		
		var token = SessionService.getToken();					
		for(var index=uploadStartIndex;uploadsInProgress<MAX_PARALLEL_UPLOADS&&index<$rootScope.filesToBeUploaded.length;index++){												
			uploadStartIndex +=1;
			uploadsInProgress+=1;
			executeAsAWebWorker(index, token, flattenZip, tags);
		}
	}

	function executeAsAWebWorker(index , token, flattenZip, tags){
		/*$log.debug('executeAsAWebWorker');*/
		var worker;
		var workerPromise = 
		WorkerService.createAngularWorker(['input', 'output', '$http', '$log',

			function (input, output, $http, $log) {						
				(function(index, file){							
					if (file && !file.$error) {     
						file.loaded = 0;        
						var fd = new FormData();
						fd.append('file', file);												
						var url = input.apiEndpoint+'/file/?X-Progress-ID='+index+'&folderId='+input.folderId+'&projectId='+input.projectId+'&flattenZip='+input.flattenZip+'&tags='+input.tags;				
						if(input.fileToBeReplaced && input.fileToBeReplaced.EntityID){
							url += '&fileToBeReplaced='+input.fileToBeReplaced.EntityID;
						}
						var oReq = new XMLHttpRequest();						
						oReq.addEventListener("load",function(resp){
							$log.debug('response received for file: ', index);
							var data = JSON.parse(resp.currentTarget.response);									
							/*$log.debug(data);*/
							output.resolve({'resp': data, 'index': index, 'uploadCompleted': true});
						});
						oReq.upload.addEventListener("load",function(resp){																
							output.notify({'loaded':resp.loaded, 'total': resp.total, 'index': index});
						});
						oReq.onerror = function(resp){							
							$log.debug('file '+index+" failed.");	
							output.resolve({'index': index, 'failed': true});
						};
						oReq.upload.addEventListener("progress", function(resp){								
							output.notify({'loaded':resp.loaded, 'total': resp.total, 'index': index});
						});						
						oReq.open("POST", url);						
						oReq.setRequestHeader("Authorization", input.token.value);						
						oReq.send(fd);
					}
				}(input.index, input.file));
}
]);

workerPromise
.then(function success(angularWorker) {      
	worker = angularWorker;  			    
	return angularWorker.run({				
		'apiEndpoint': ENV.apiEndpoint,
		'folderId': getSelectedItem(0),
		'projectId': getSelectedItem(1),
		'tags': processTags(tags),		
		'token': token,		
		'flattenZip': flattenZip,
		'index': index,
		'file': $rootScope.filesToBeUploaded[index],
		'fileToBeReplaced': $rootScope.fileToBeReplaced
	});
}, function error(reason) {

	$log.error('callback error');
	$log.error(reason);
}).then(function success(data) {					
	updateProgressBar(data.index, flattenZip, tags,data, worker);		
}, function error(result) {
	$log.error('error');
	$log.error(result);
}, function notify(data) {     				
	updateProgressBar(data.index, flattenZip, tags,data);		
});
}

$rootScope.calculateFilesProgress=calculateFilesProgress;

function calculateFilesProgress() {
	var filesUploaded = 0;
	$rootScope.filesToBeUploaded.forEach(function(item) {
		if (item.uploadSuccess) {
			filesUploaded += 1;
		}
	});      

	if($rootScope.filesToBeUploaded.length === filesUploaded){
		$interval.cancel($rootScope.intervalTimer);	
	}

	if($rootScope.fileUploadPusherEvents){
		console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!$rootScope.fileUploadPusherEvents.length, $rootScope.filesToBeUploaded.length: ', $rootScope.fileUploadPusherEvents.length, $rootScope.filesToBeUploaded.length);	
	}
	
	//TODO: Take failed uploads into account
	if($rootScope.fileUploadPusherEvents && $rootScope.fileUploadPusherEvents.length === $rootScope.filesToBeUploaded.length){
		/*$modalInstance.close();*/
		$log.info('upload took: ',moment().diff($rootScope.uploadStartTime,'seconds'),' seconds');		
		//TODO: Move these properties to an object to avoid conflicts on root scope.
		cleanUpFileUploadStatus();	
	}
}

function cleanUpFileUploadStatus(){
	$rootScope.filesToBeUploaded = [];
		$rootScope.aggregateFilesProgressPercentage=0;
		$rootScope.fileProgressArray=[];
		$rootScope.fileUploadAlerts=[];
		$rootScope.filesUploadInProgress = false;
		$rootScope.aggregateFilesProgress=0;
		$rootScope.fileToBeReplaced=undefined;
		uploadStartIndex=0;
		uploadsInProgress=0;
		$rootScope.fileUploadPusherEvents=[];
		$rootScope.$broadcast('closeUploadModal');
		$interval.cancel($rootScope.intervalTimer);
}

$scope.showUploadFilesModal = function() {     
	var modalInstance;
	modalInstance = $modal.open({
		templateUrl: 'views/common/file-upload.html',
		controller: 'FileUploadCtrl as modal',
		backdrop: 'static',
		resolve: {
			projectsAndFolders: function() {            
				return [];
			},
			selectedItem: function() {
				return {};
			},
			fileToBeReplaced: function() {
				return $rootScope.fileToBeReplaced || {};
			}
		}
	});
	modalInstance.result.then(function() {
        //TODO: refresh page if we are on library
    });
};

function updateProgressBar(index, flattenZip, tags, data, worker){
	if(worker){		
		worker.terminate();
	}

	if(!$rootScope.filesToBeUploaded || $rootScope.filesToBeUploaded.length <=0){
		return;
	}

	var loaded = data.loaded;
	var total = data.total;
	if(data.uploadCompleted){
		uploadsInProgress -= 1;
		if($rootScope.filesToBeUploaded.length>MAX_PARALLEL_UPLOADS){
			uploadFiles(undefined, flattenZip, tags);
		}		
		$rootScope.filesToBeUploaded[data.index].result = data.resp;
		var file = $rootScope.filesToBeUploaded[data.index];
		if(data.failed){
			loaded = 0;
			total = file.size;
			$rootScope.filesToBeUploaded[data.index].uploadFailed = true;	
		} else{			
			loaded = file.size;
			total = file.size;			
			/*$rootScope.filesToBeUploaded[data.index]  = {};*/
			$rootScope.filesToBeUploaded[data.index].uploadSuccess = true;
		}

		calculateFilesProgress();
	}

	var file = $rootScope.filesToBeUploaded[index];	
	if(file){
		file.loaded = loaded;
		file.progressPercentage = parseInt(100.0 * file.loaded / total);  
		
		$rootScope.fileProgressArray[index]=file.loaded;   		

		var aggregateFilesProgress = 0;
		$rootScope.fileProgressArray.forEach(function(progress){
			aggregateFilesProgress += progress;
		});                    
		$rootScope.aggregateFilesProgress = aggregateFilesProgress;
		$rootScope.aggregateFilesProgressPercentage = parseInt(100.0 * $rootScope.aggregateFilesProgress / $rootScope.getTotalFilesSize());                        
		populateEstimatedTime();
	}	  
}

		//isolated pusher related functionality into a seperate controller
		angular.extend(this, $controller('PusherEventHandler', {}));

	}]);