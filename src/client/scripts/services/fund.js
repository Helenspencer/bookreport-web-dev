(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.LibrarySvc
   @description
   LibrarySvc
   Service in the app.
   */
   angular.module('app').factory('FundSvc', FundSvc);

   FundSvc.$inject = [
   '$resource', '$q', 'ENV', 'SessionService'
   ];

   function FundSvc($resource, $q, ENV, SessionService) {
    return {
      getTemplate: getTemplate,
      getTemplates: getTemplates,
      saveTemplate: saveTemplate,
      saveFund:saveFund,
      getFunds: getFunds,
      getFund: getFund
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/fund/:param/:id', {}, {
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
    

    function getTemplate(id) {
      var deferred;
      deferred = $q.defer();    

      service().get({'param':'template','id':id}, {}, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function getTemplates() {
      var deferred;
      deferred = $q.defer();    

      service().list({'param':'template'}, {}, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function saveTemplate(data) {
      var deferred;
      deferred = $q.defer();    
      if(data.EntityID){
       service().update({'param':'template', 'id': data.EntityID}, data, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
     } else{
       service().add({'param':'template'}, data, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });   
     }
     
     return deferred.promise;
   }

   function getFund(id) {
    var deferred;
    deferred = $q.defer();    

    service().get({'id':id}, {}, function(resp) {       
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  }

  function saveFund(data) {
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
 function getFunds(projectId) {
  var deferred;
  deferred = $q.defer();    

  service().list({'param':'project', 'id': projectId}, {}, function(resp) {       
    return deferred.resolve(resp);
  }, function(err) {
    return deferred.reject(err);
  });
  return deferred.promise;
}
}
})();