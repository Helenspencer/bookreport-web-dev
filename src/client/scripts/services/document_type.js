(function() {
  'use strict';
  angular.module('app').factory('DocumentTypeSvc', DocumentTypeSvc);

  DocumentTypeSvc.$inject = [
  '$resource', '$q', 'ENV', 'SessionService'
  ];

  function DocumentTypeSvc($resource, $q, ENV, SessionService) {
    return {
      getType: getType,
      getTypes: getTypes,
      saveType: saveType
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/document/type/:id', {}, {
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
        'add': {
          'method': 'POST',
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
        }
      });
    }
    

    function getType(id) {
      var deferred;
      deferred = $q.defer();    

      service().get({'id':id}, {}, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function getTypes() {
     var deferred;
     deferred = $q.defer();
     service().list({}, function(users) {
      return deferred.resolve(users);
    }, function(err) {
      return deferred.reject(err);
    });
     return deferred.promise;
   }

   function saveType(data) {
    var deferred;
    deferred = $q.defer();    
    if(data.EntityID){
     service().update({'id': data.EntityID}, data, function(resp) {  
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
   } else{
     service().add({}, data, function(resp) {       
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });   
   }

   return deferred.promise;
 }
}
})();