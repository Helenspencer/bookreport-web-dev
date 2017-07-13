(function() {
  'use strict';

  function UsersSvc($resource, $cookies, $q, ENV, SessionService, localStorageService) {   

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/user/:id?organizationId=:organizationId', {}, {
        'list': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          },
          'isArray': true
        },
        'get': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        },
        'update': {
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        },
        'add': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        },
        'delete': {
          'method': 'DELETE',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        }
      });
    }

    function changePasswordService() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/user/changepassword', {}, {
        'change': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        }
      });
    }

    function resetPasswordService() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/guest/resetpassword', {}, {
        'reset': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        }
      });
    }

    function setToken(token) {
      if (localStorageService.get('token')) {
        return localStorageService.set('token', token);
      } else {
        return localStorageService.cookie.set('token', token);
      }
    }

    function list() {
      var deferred;
      deferred = $q.defer();
      service().list({}, function(users) {
        return deferred.resolve(users);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function get(id, organizationId) {
      var deferred;
      deferred = $q.defer();
   
      service().get({
        'id': id,
        'organizationId': organizationId
      }, 

      function(users) {
        return deferred.resolve(users);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
           }

    function save(user, organizationId) {
      var deferred;
      deferred = $q.defer();
      if (user.EntityID) {
        service().update({'id':user.EntityID, 'organizationId': organizationId}, user, function() {
          return SessionService.getUser(true).then(function(user) {
            return deferred.resolve(user);
          });
        }, function(err) {
          return deferred.reject(err);
        });
      } else {
        service().add({}, user, function(resp) {
          return deferred.resolve(resp);
        }, function(err) {
          return deferred.reject(err);
        });
      }
      return deferred.promise;
    }

    function remove(id) {
      var deferred;
      deferred = $q.defer();
      service()['delete']({
        'id': id
      }, function(users) {
        return deferred.resolve(users);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function changePassword(data) {
      var deferred;
      deferred = $q.defer();
      changePasswordService().change({}, {
        'UserAccountID': data.UserAccountID,
        'NewPassword': data.NewPassword
      }, function(resp) {
        setToken(resp.AuthToken);
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function resetPassword(data) {
      var deferred;
      deferred = $q.defer();
      resetPasswordService().reset({}, data, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    return {
      list: list,
      get: get,
      save: save,
      remove: remove,
      changePassword: changePassword,
      resetPassword : resetPassword
    };
  }

  UsersSvc.$inject = [
  '$resource', '$cookies', '$q', 'ENV', 'SessionService', 'localStorageService'
  ];

  angular
  .module('app')
  .factory('UsersSvc', UsersSvc);
})();