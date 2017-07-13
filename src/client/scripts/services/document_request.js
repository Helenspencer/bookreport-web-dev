(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.LibrarySvc
   @description
   LibrarySvc
   Service in the app.
   */
   angular.module('app').factory('DocumentRequestSvc', DocumentRequestSvc);

   DocumentRequestSvc.$inject = [
   '$resource', '$q', 'ENV', 'SessionService'
   ];

   function DocumentRequestSvc($resource, $q, ENV, SessionService) {
    return {
     list:list,
     save:save,
     get: get
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/document-request/:id/?projectId=:projectId', {}, {
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
        }
      });
    }
    

    function list(projectId) {
      var deferred;
      deferred = $q.defer();    

      service().list({'projectId':projectId}, {}, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }
    
   function save(data) {
      var deferred;
      deferred = $q.defer();

      if (data.EntityID) {
        service().update({
          'id': data.EntityID
        }, data, function(resp) {
          return deferred.resolve(resp);
        }, function(err) {
          return deferred.reject(err);
        });
      } else {
        service().add({}, data, function(resp) {
          return deferred.resolve(resp);
        }, function(err) {
          return deferred.reject(err);
        });
      }
      return deferred.promise;
    }

    function get(id) {
      var deferred;
      deferred = $q.defer();    

      service().get({'id':id}, {}, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }
}
})();