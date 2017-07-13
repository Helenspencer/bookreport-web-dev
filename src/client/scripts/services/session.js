(function() {
  'use strict';

  function SessionService($resource, $q, $cookieStore, ENV, localStorageService) {

    var data = {};

    function service() {
      return $resource(ENV.apiEndpoint + '/guest/:param', {}, {
        'login': {
          'method': 'POST'
        },
        'logout': {
          'method': 'DELETE'
        },
        'signup': {
          'method': 'POST'
        }
      });
    }

    function profileService() {
      var token;
      token = getToken() || null;
      return $resource(ENV.apiEndpoint + '/user/profile', {}, {
        'get': {
          'method': 'GET',
          'headers': {
            'Authorization': token.value
          }
        },
        'update': {
          'method': 'PUT',
          'headers': {
            'Authorization': token.value
          }
        }
      });
    }

    function camelCase(str) {
      return str.replace(' ', '');
    }

    function populateUserPermission(user) {
      if (user.CurrentOrganization && user.CurrentOrganization.Permission) {
        var permission = user.CurrentOrganization.Permission;

        user['is' + camelCase(permission)] = true;
      }
    }

    function setUser(user) {
      populateUserPermission(user);
      data.user = user;
      setId(data.user.UserAccountID);
      data.userId = data.user.UserAccountID;
    }

    function setToken(token, rememberMe) {
      if (rememberMe) {
        localStorageService.cookie.set('token', token);
      } else {
        localStorageService.set('token', token);
      }
    }

    function setId(id) {
      if (localStorageService.cookie.get('token')) {
        return localStorageService.cookie.set('id', id);
      } else {
        return localStorageService.set('id', id);
      }
    }

    function getToken() {
      var token;

      if (localStorageService.get('token')) {
        token = localStorageService.get('token');
      } else {
        token = localStorageService.cookie.get('token');
      }

      return {
        'value': 'Basic ' + token
      };
    }

    function login(newUser, resultHandler, errorHandler) {
      var rememberMe, user;
      rememberMe = newUser.rememberMe;
      user = angular.copy(newUser);
      delete user.rememberMe;
      return service().login({
        'param': 'login'
      }, user, function(res) {
        if (res.AuthToken) {
          setToken(res.AuthToken, rememberMe);
        }
        return resultHandler(res);
      }, function(err) {
        return errorHandler(err);
      });
    }

    function logout(userId, resultHandler) {
      localStorageService.clearAll();
      localStorageService.cookie.clearAll();
      data.userId = void 0;
      data.user = void 0;
      resultHandler();
    }

    function isAuthorized() {
      var value = getToken().value.split('Basic ');

      return value[1] && value[1] !== 'null' && value[1].length > 0;
    }

    function getUser(forceGet) {
      var deferred;
      deferred = $q.defer();
      if (!forceGet && data.user) {
        deferred.resolve(data.user);
      } else if (isAuthorized()) {
        profileService().get({}, function(user) {
          setUser(user);
          return deferred.resolve(data.user);
        }, function(err) {
          return deferred.reject(err);
        });
      }
      return deferred.promise;
    }

    function updateProfile(profile) {
      var deferred;
      deferred = $q.defer();
      profileService().update({}, profile, function() {
        profileService().get({}, function(user) {
          setUser(user);
          deferred.resolve(data.user);
        }, function(err) {
          deferred.reject(err);
        });
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function signup(newUser, resultHandler, errorHandler) {
      var user;
      user = angular.copy(newUser);

      return service().signup({
        'param': 'signup'
      }, user, function(res) {
        if (res.AuthToken) {
          setToken(res.AuthToken, false);
        }
        return resultHandler(res.data);
      }, function(err) {
        return errorHandler(err.data);
      });
    }

    return {
      login: login,
      logout: logout,
      getUser: getUser,
      updateProfile: updateProfile,
      isAuthorized: isAuthorized,
      getToken: getToken,
      signup: signup
    };
  }

  SessionService.$inject = [
    '$resource', '$q', '$cookieStore', 'ENV', 'localStorageService'
  ];

  angular
    .module('app')
    .factory('SessionService', SessionService);
})();