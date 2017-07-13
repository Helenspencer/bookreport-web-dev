(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.organization
   @description
   organization
   Service in the app.
   */
  angular.module('app').factory('OrganizationsSvc', OrganizationsSvc);

  OrganizationsSvc.$inject = [
    '$resource', '$cookies', '$q', 'ENV', 'SessionService'
  ];

  function OrganizationsSvc($resource, $cookies, $q, ENV, SessionService) {

     return {
      list: list,
      get: get,
      save: save,      
      remove: remove,
      inviteUser: inviteUser,
      removeUser : removeUser
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/organization/:id', {}, {
        'list': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          },
          'isArray': true
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
        'get': {
          'method': 'GET',
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
        },
        'invite': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        },
        'removeUser': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        }
      });
    }

    function linkService() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/link/:id', {}, {
        'removeUser': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        }
      });
    }

    function list() {
      var deferred;
      deferred = $q.defer();
      service().list({}, function(organizations) {
        return deferred.resolve(organizations);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function get(id) {
      var deferred;
      deferred = $q.defer();
      service().get({
        'id': id
      }, function(organization) {
        return deferred.resolve(organization);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function save(organization) {
      var deferred;
      deferred = $q.defer();
      if (organization.EntityID) {
        service().update({'id':organization.EntityID}, organization, function(resp) {
          return deferred.resolve(resp);
        }, function(err) {
          return deferred.reject(err);
        });
      } else {
        service().add({}, organization, function(resp) {
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
      }, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function inviteUser(data) {
      var deferred;
      deferred = $q.defer();
      service().invite({
        'id': 'inviteuser'
      }, data, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function removeUser(data) {
      var deferred;
      deferred = $q.defer();
      linkService().removeUser({
        'id': 'removeuser'
      }, data, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }
  }

})();