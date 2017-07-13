'use strict';
angular.module('documentApp', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ui.router',
  'ngSanitize',
  'ngTouch',
  'ui.bootstrap',
  'ui.tree',
  'ngTagsInput',  
  'config',
  'jm.i18next',
  'LocalStorageModule',
  'dialogs.main',
  'angularMoment',
  'ui.select',
  'ui.sortable',
  'pusher-angular',
  'app.factory',
  'FBAngular',
  'ngDragDrop',
  'app.directives-custom',
  'pusher-cedarwood',
  'cedarwood-common',
  'textAngular',
  'pdfjsViewer',
  'wj'
    ])
.run(function() {
    // Page Loading Overlay
    public_vars.$pageLoadingOverlay = jQuery('.page-loading-overlay');

    jQuery(window).load(function() {
      public_vars.$pageLoadingOverlay.addClass('loaded');
    })
  })
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/documentApp/view');

  $stateProvider.
      // Main Layout Structure
      state('documentApp', {
        abstract: true,
        url: '/documentApp',
        templateUrl: appHelper.templatePath('layout/app-body'),
        controller: function($rootScope) {
          $rootScope.isLoginPage = false;
          $rootScope.isPublicPage = false;
          $rootScope.isLightLoginPage = false;
          $rootScope.isLockscreenPage = false;
          $rootScope.isMainPage = true;
        }
      }).state('documentApp.view', {
        url: '/view',
        templateUrl: appHelper.templatePath('document/view')
      });
    }])
.config([
  'localStorageServiceProvider',
  function(localStorageServiceProvider) {
    localStorageServiceProvider.setStorageCookie(30, '/');
    return localStorageServiceProvider.setStorageType('sessionStorage');
  }
  ])
.config([
  'uiSelectConfig',
  function(uiSelectConfig) {
    return uiSelectConfig.theme = 'bootstrap';
  }
  ])
.config([
  '$httpProvider',
  function($httpProvider) {
    return $httpProvider.interceptors.push([
      '$q', '$location',
      function($q, $location) {
        return {
          'request': function(config) {
            return config;
          },
          'response': function(response) {
            return response;
          },
          'responseError': function(rejection) {

            console.log('rejection:', rejection)
            if (rejection && rejection.status && rejection.status === 401) {
              $location.path('/login');
            }
            return $q.reject(rejection);
          }
        };
      }
      ]);
  }
  ])
  .constant('PusherEvents', {})
  .constant('PusherEvents', {    
    DOCUMENT_EVENT: 'doc_event'
  })
  .constant('PusherChannels', {
    CEDARWOOD: 'cedarwood',
  })
  .constant('AppConfig', {    
    'DataTypes': [
    {'Name':'String','Value':0},
    {'Name':'Date','Value':1},
    {'Name':'Number','Value':2}
    ]

  })
.config(['$logProvider', 'ENV',function($logProvider, ENV){
  $logProvider.debugEnabled(ENV.debugEnabled);
}]);