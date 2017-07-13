(function () {
	'use strict';

	angular.module('documentApp').controller('BasicController', BasicController);
	BasicController.$inject =['$scope', 'DocumentSvc', '$http', '$rootScope'];
	function BasicController ($scope, DocumentSvc, $http, $rootScope) {
		var applyFillColor = false,
		updatingSelection = false,
		updatingWithImport = false,
		pendingAction,
		appliedClass,
		cellStyleApplying;

		var vm = this;
		var queryParams = jQuery.getQueryParameters();
		//decodeURIComponent is used in case the token in the URL has any characters
        //that the browser escapes (= signs in particular)
		vm.token = decodeURIComponent(queryParams.token);
		vm.fileId = queryParams.fileId;
		vm.excelView = true;
		vm.fileUrl = queryParams.url+'/file/'+queryParams.fileId+'/?token='+queryParams.token+'&excelView='+vm.excelView;

		vm.file = {"EntityID": vm.fileId};

		function load() {
			$http.get(vm.fileUrl).success(function(response) {
				var flexSheet = $scope.ctx.excelIOSheet;
				vm.fileData = response;
				flexSheet.loadAsync(vm.fileData);
				$rootScope.$broadcast('excelsheetLoaded');

				flexSheet.cellEditEnded.addHandler(function (sender, args) {
					flexSheet.saveAsync( ' ', function(response){
						saveFile(response);
					}, function(reason){
						console.log(reason);
					});
				});
			});
		}

		function saveFile(fileContent){
			vm.file.FileContents=fileContent;
			if(fileContent){
				console.log("saving file...");
				DocumentSvc.saveFile(vm.token, vm.file).then(function(){
					// load();
				});
			}
		}
		load();
	}
})();