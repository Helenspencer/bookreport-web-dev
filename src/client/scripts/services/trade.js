(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.LibrarySvc
   @description
   LibrarySvc
   Service in the app.
   */
   angular.module('app').factory('TradeSvc', TradeSvc);

   TradeSvc.$inject = [
   '$resource', '$q', 'ENV', 'SessionService'
   ];

   function TradeSvc($resource, $q, ENV, SessionService) {
    return {
      getType: getType,
      getTypes: getTypes,
      saveType: saveType,
      saveTrade: saveTrade,
      getTrade: getTrade,
      getTrades: getTrades
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/trade/:param/:id', {}, {
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

      service().get({'param':'type','id':id}, {}, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function getTypes() {
      var deferred;
      deferred = $q.defer();    

      service().list({'param':'type'}, {}, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function saveType(data) {
      var deferred;
      deferred = $q.defer();    
      if(data.EntityID){
       service().update({'param':'type', 'id': data.EntityID}, data, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
     } else{
       service().add({'param':'type'}, data, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });   
     }
     
     return deferred.promise;
   }

   function getTrade(id) {
    var deferred;
    deferred = $q.defer();    

    service().get({'id':id}, {}, function(resp) {       
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  }

  function getTrades(fundId) {
    var deferred;
    deferred = $q.defer();    

    service().list({'param':'fund', 'id': fundId}, {}, function(resp) {       
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  }

  function saveTrade(data) {
    var deferred;
    deferred = $q.defer();    
    if(data.EntityID){
     service().update({ 'id': data.EntityID}, data, function(resp) {       
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