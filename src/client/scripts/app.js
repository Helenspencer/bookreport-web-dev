'use strict';
angular.module('app', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ui.router',
  'ngSanitize',
  'ngTouch',
  'ui.bootstrap',
  'ui.tree',
  'ngTagsInput',
  'app.controllers',
  'app.directives',
  'app.directives-custom',
  'app.diagram',
  'app.localization',
  'app.factory',
  'app.services',
  'config',
  'jm.i18next',
  'LocalStorageModule',
  'dialogs.main',
  'angularMoment',
  'ui.select',
  'ui.sortable',
  'pusher-angular',
  // Added in v1.3
  'FBAngular',
  'ngFileUpload',
  'debounce',
  'uuid',
  'FredrikSandell.worker-pool',
  'pusher-cedarwood',
  'textAngular',
  'cedarwood-common'
    ])
.run(function() {
    // Page Loading Overlay
    public_vars.$pageLoadingOverlay = jQuery('.page-loading-overlay');

    jQuery(window).load(function() {
      public_vars.$pageLoadingOverlay.addClass('loaded');
    })
  })
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('app/dashboard');

  $stateProvider.
      // Main Layout Structure
      state('app', {
        abstract: true,
        url: '/app',
        templateUrl: appHelper.templatePath('layout/app-body'),
        controller: function($rootScope) {
          $rootScope.isLoginPage = false;
          $rootScope.isPublicPage = false;
          $rootScope.isLightLoginPage = false;
          $rootScope.isLockscreenPage = false;
          $rootScope.isMainPage = true;
        }
      }).state('app.dashboard', {
        url: '/dashboard',
        templateUrl: appHelper.templatePath('dashboard')
      }).
      state('app.library', {
        url: '/library',
        templateUrl: appHelper.templatePath('library/list'),
        controller: 'LibraryCtrl as library'
      }).
      state('app.diagram', {
        url: '/diagram',
        templateUrl: appHelper.templatePath('diagram/main'),
        controller: 'DiagramCtrl'
      }).
      state('login', {
        url: '/login',
        templateUrl: appHelper.templatePath('login'),
        controller: 'LoginCtrl as loginCtrl'
      }).
      state('signup', {
        url: '/signup',
        templateUrl: appHelper.templatePath('signup'),
        controller: 'SignUpCtrl as signUpCtrl'
      }).
      state('forgot-password', {
        url: '/forgot-password',
        templateUrl: appHelper.templatePath('pages/forgot-password'),
        controller: 'ResetPasswordCtrl as resetPasswordCtrl'
      }).
      state('app.appUser', {
        url: '/appUsers',
        templateUrl: appHelper.templatePath('app-users/list'),
        controller: 'AppUsersCtrl'
      }).
      state('app.organizations', {
        url: '/organizations',
        templateUrl: appHelper.templatePath('organizations/list'),
        controller: 'OrganizationsCtrl as organizationsCtrl'
      }).
      state('app.organizationEdit', {
        url: '/organizations/:id',
        templateUrl: appHelper.templatePath('organizations/form'),
        controller: 'OrganizationsCtrl as organizationsCtrl'
      }).
      state('app.settings', {
        url: '/settings',
        templateUrl: appHelper.templatePath('organizations/form'),
        controller: 'OrganizationsCtrl as organizationsCtrl'
      }).
      state('app.organizationUserEdit', {
        url: '/organizations/:id/users/:userId',
        templateUrl: appHelper.templatePath('organizations/users/form'),
        controller: 'OrganizationUserCtrl as organizationUserCtrl'
      }).
      state('app.settingsUserEdit', {
        url: '/settings/users/:userId',
        templateUrl: appHelper.templatePath('organizations/users/form'),
        controller: 'OrganizationUserCtrl as organizationUserCtrl'
      }).
      state('app.engagements', {
        url: '/engagements',
        templateUrl: appHelper.templatePath('engagements/list'),
        controller: 'EngagementsCtrl as engagementsCtrl'
      }).
      state('app.engagementEdit', {
        url: '/engagements/:id',
        templateUrl: appHelper.templatePath('engagements/form'),
        controller: 'EngagementsCtrl as engagementsCtrl'
      }).
      state('app.proposals', {
        url: '/proposals',
        templateUrl: appHelper.templatePath('proposals/list'),
        controller: 'ProposalsCtrl as proposalsCtrl'
      }).
      state('app.proposalEdit', {
        url: '/proposals/:id?decision',
        templateUrl: appHelper.templatePath('proposals/form'),
        controller: 'ProposalsCtrl as proposalsCtrl'
      }).
      state('app.projects', {
        url: '/projects',
        templateUrl: appHelper.templatePath('projects/list'),
        controller: 'ProjectsCtrl as projectsCtrl'
      }).
      state('app.projectEdit', {
        url: '/projects/:id',
        templateUrl: appHelper.templatePath('projects/form'),
        controller: 'ProjectsCtrl as projectsCtrl'
      }).
      state('app.fundTemplate', {
        url: '/fundTemplates',
        templateUrl: appHelper.templatePath('fund-template/form'),
        controller: 'FundTemplatesCtrl as fundTemplatesCtrl'
      }).
     /* state('app.fundTemplateEdit', {
        url: '/fundTemplates/:id',
        templateUrl: appHelper.templatePath('fund-template/form'),
        controller: 'FundTemplatesCtrl as fundTemplatesCtrl'
      }).*/
      state('app.tradeTypes', {
        url: '/tradeTypes',
        templateUrl: appHelper.templatePath('trade-types/list'),
        controller: 'TradeTypesCtrl as tradeTypesCtrl'
      }).
      state('app.tradeTypeEdit', {
        url: '/tradeTypes/:id',
        templateUrl: appHelper.templatePath('trade-types/form'),
        controller: 'TradeTypesCtrl as tradeTypesCtrl'
      }).

      state('app.fundEdit', {
        url: '/projects/:projectId/funds/:id',
        templateUrl: appHelper.templatePath('funds/form'),
        controller: 'FundsCtrl as fundsCtrl'
      }).

      state('app.detailsFile', {
        url: '/library/files/:id',        
        templateUrl: appHelper.templatePath('library/file_details'),
        controller: 'FileDetailsCtrl as fileDetailsCtrl'
      }).
      state('app.trade', {
        url: '/trade',
        templateUrl: appHelper.templatePath('trade/list'),
        controller: 'TradeCtrl as tradeCtrl'
      }).
      state('app.tradeEdit', {
        url: '/projects/:projectId/funds/:fundId/trades/:id',
        templateUrl: appHelper.templatePath('trade/form'),
        controller: 'TradeCtrl as tradeCtrl'
      }).
      state('app.milestonesEdit', {
        url: '/projects/:projectId/milestones/:id',
        templateUrl: appHelper.templatePath('projects/milestones/form'),
        controller: 'MilestonesCtrl as milestonesCtrl'
      }).
      state('app.projectTypes', {
        url: '/projectTypes',
        templateUrl: appHelper.templatePath('project-types/list'),
        controller: 'ProjectTypesCtrl as projectTypesCtrl'
      }).
      state('app.projectTypeEdit', {
        url: '/projectTypes/:id',
        templateUrl: appHelper.templatePath('project-types/form'),
        controller: 'ProjectTypesCtrl as projectTypesCtrl'
      }).
       state('app.documentTypes', {
        url: '/documentTypes',
        templateUrl: appHelper.templatePath('document-types/list'),
        controller: 'DocumentTypesCtrl as documentTypesCtrl'
      }).
       state('app.documentTypeEdit', {
        url: '/documentTypes/:id',
        templateUrl: appHelper.templatePath('document-types/form'),
        controller: 'DocumentTypesCtrl as documentTypesCtrl'
      }).
      state('app.documentRequestsEdit', {
        url: '/projects/:projectId/document-requests/:id',
        templateUrl: appHelper.templatePath('projects/document-requests/form'),
        controller: 'DocumentRequestsCtrl as documentRequestsCtrl'
      });
    }])
.config([
  '$i18nextProvider',
  function($i18nextProvider) {
    return $i18nextProvider.options = {

      /*lng: 'de', */
      useCookie: false,
      useLocalStorage: false,
      fallbackLng: 'dev',
      resGetPath: './locales/__lng__/__ns__.json',
      defaultLoadingValue: ''
    };
  }
  ]).config([
  'localStorageServiceProvider',
  function(localStorageServiceProvider) {
    localStorageServiceProvider.setStorageCookie(30, '/');
    return localStorageServiceProvider.setStorageType('sessionStorage');
  }
  ]).config([
  'uiSelectConfig',
  function(uiSelectConfig) {
    return uiSelectConfig.theme = 'bootstrap';
  }
  ]).config([
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
  .constant('PusherEvents', {
    ORGANIZATION_EVENT: 'org_event'
  })
  .constant('PusherChannels', {
    CEDARWOOD: 'cedarwood',
  })
  .constant('AppConfig', {
    'permissions': [{
      'key': 'Organization Admin',
      'value': 'Organization Admin'
    }, {
      'key': 'Manager',
      'value': 'Manager'
    }, {
      'key': 'Associate',
      'value': 'Associate'
    }, {
      'key': 'Analyst',
      'value': 'Analyst'
    }],
    'Project_Permissions': [{
      'key': 1,
      'value': 'Client'
    }, {
      'key': 2,
      'value':'Participant'
    }],
     'Status': [
    {'Name':'Not Started','Value':0},
    {'Name':'In Progress','Value':1},
    {'Name':'Complete','Value':2}
    ],
    'DataTypes': [
    {'Name':'String','Value':0},
    {'Name':'Date','Value':1},
    {'Name':'Number','Value':2}
    ],
    'Actionvalues': [
    {'Name':'uploaded','Value':0},
    {'Name':'reprocessed','Value':1},
    {'Name':'name changed','Value':2},
    {'Name':'name changed','Value':3},
    {'Name':'content changed','Value':4},
    {'Name':'Document type changed ','Value':5},
    {'Name':' content changed ','Value':6},
    {'Name':' archived ','Value':7}
    ]
  })
  .run(['WorkerService', 'ENV', function (WorkerService, ENV) {
      //WorkerService.setAngularUrl('../bower_components/angular/angular.js');
      WorkerService.setAngularUrl(ENV.appHost+'/bower_components/angular/angular.min.js');
      /*WorkerService.addDependency('Upload', 'ngFileUpload', 'http://localhost:9000/bower_components/ng-file-upload/ng-file-upload.min.js');*/      
  }])
  .run(['$rootScope', '$location', '$state', 'SessionService', function($rootScope, $location, $state, SessionService) {


    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {

      var isPublicPage = toState.name === "login" | toState.name === "forgot-password" | toState.name === "signup";
      if (isPublicPage) {        
        return;
      }

      //Note only allow library/protect route to all users and everything else
      //to cedarwood user only. This secures from users meddling with url bar.
      //These routes still needs to be protected in the backend to avoid data leakage            
      if(toState.name !== 'app.proposalEdit' && toState.name !== 'app.library' && toState.name !== 'app.projects' && toState.name !== 'app.projectEdit' && toState.name !== 'app.documentRequestsEdit' && ($rootScope.user && !$rootScope.user.IsCedarwoodUser)){
        e.preventDefault();
        $state.go('app.projects', $state.params, { reload: true });                
      }
      
      if (!SessionService.isAuthorized()) {        
        e.preventDefault(); // stop current execution
        $rootScope.returnToState = toState.name;
        $rootScope.returnToStateParams = toParams;              
        $state.go('login'); // go to login        
      }
    });
}]
).config(['$logProvider', 'ENV',function($logProvider, ENV){
  $logProvider.debugEnabled(ENV.debugEnabled);
}]).filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
}]);
// update popover template for binding unsafe html
angular.module("template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/popover/popover.html",
      "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"arrow\"></div>\n" +
      "\n" +
      "  <div class=\"popover-inner\">\n" +
      "      <h3 class=\"popover-title\" ng-bind-html=\"title | unsafe\" ng-show=\"title\"></h3>\n" +
      "      <div class=\"popover-content\"ng-bind-html=\"content | unsafe\"></div>\n" +
      "  </div>\n" +
      "</div>\n" +
      "");
}]);