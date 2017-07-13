(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.FolderSvc
   @description
   FolderSvc
   Service in the app.
   */
   angular.module('app').factory('FolderSvc', FolderSvc);

   FolderSvc.$inject = [
   '$resource', '$q', 'ENV', 'SessionService'
   ];


   function FolderSvc($resource, $q, ENV, SessionService) {

    return{
      get:get,
      save : save,
      list: list
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/folder/:id', {}, {
        'create': {
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
        },
        'get': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        },
        'list': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          },
          'isArray': true
        }
      });
    }

    function save(data) {
      var deferred;
      deferred = $q.defer();
      if(data.EntityID){
        service().update({'id': data.EntityID}, data, function(resp) {
          return deferred.resolve(resp);
        }, function(err) {
          return deferred.reject(err);
        });
      }else{
       service().create({}, data, function(resp) {
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
    service().get({
      'id': id
    }, function(item) {
      /*item.Type=0;*/
      return deferred.resolve(item);
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  }

  function list() {
    var deferred;
    deferred = $q.defer();
    service().list({
      
    }, function(items) {      
      items.forEach(function(item){
        item.Type=0;
      });
      return deferred.resolve(items);
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  }
}
})();