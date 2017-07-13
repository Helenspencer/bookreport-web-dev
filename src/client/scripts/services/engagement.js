(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.engagement
   @description
   engagement
   Service in the app.
   */
  angular.module('app').factory('EngagementsSvc', EngagementsSvc);

  EngagementsSvc.$inject = [
    '$resource', '$cookies', '$q', 'ENV', 'SessionService'
  ];

  function EngagementsSvc($resource, $cookies, $q, ENV, SessionService) {

    return {
      list: list,
      get: get,
      save: save,
      remove: remove
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/engagement/:id', {}, {
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
        }
      });
    }

    function list() {
      var deferred;
      deferred = $q.defer();
      service().list({}, function(engagements) {
        if (engagements) {
          engagements.forEach(function(item) {
            if (item.Schedules) {
              item.Schedules = item.Schedules.join(',');
            }
          });
        }
        return deferred.resolve(engagements);
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
      }, function(engagement) {
        if (engagement.Schedules) {
          engagement.Schedules = engagement.Schedules.join(',');
        }

        return deferred.resolve(engagement);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function save(data) {
      var deferred;
      deferred = $q.defer();
      var engagement = angular.copy(data);
      if (engagement.Schedules) {
        engagement.Schedules = engagement.Schedules.split(',');
      } else {
        engagement.Schedules = [];
      }

      if (engagement.EntityID) {
        service().update({
          'id': engagement.EntityID
        }, engagement, function(resp) {
          return deferred.resolve(resp);
        }, function(err) {
          return deferred.reject(err);
        });
      } else {
        service().add({}, engagement, function(resp) {
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
  }

})();