'use strict';
angular.module('app').
controller('SidebarMenuCtrl', function($scope, $rootScope, $menuItems, $timeout, $location, $state, $layout, $stateParams) {

	// Menu Items
	var $sidebarMenuItems = $menuItems.instantiate();

	$scope.menuItems = $sidebarMenuItems.prepareSidebarMenu().getAll();
	var url = processUrl();

	// Set Active Menu Item
	$sidebarMenuItems.setActive(url);

	$rootScope.$on('$stateChangeSuccess', function() {
		var path = processUrl();
		$sidebarMenuItems.setActive(path);
	});

	// Trigger menu setup
	public_vars.$sidebarMenu = public_vars.$body.find('.sidebar-menu');
	$timeout(setup_sidebar_menu, 1);

	function processUrl()
    {
      var url = $location.path();
      
      if($stateParams.id || $stateParams.userId){
        var urlPart = url.split('/');     
        urlPart.pop(urlPart.length-1);
        url = urlPart.join('/');
      }
      return url;
    }		

	ps_init(); // perfect scrollbar for sidebar
});