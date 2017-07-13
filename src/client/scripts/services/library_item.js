(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.LibraryItemSvc
   @description
   LibraryItemSvc
   Service in the app.
   */
  angular.module('app').factory('LibraryItemSvc', LibraryItemSvc);

  LibraryItemSvc.$inject = [
    '$resource', '$q', 'ENV', 'SessionService'
  ];


  function LibraryItemSvc($resource, $q, ENV, SessionService) {

    return{
      save : save
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/libraryitem/:id', {}, {
        'update': {
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        }
      });
    }

    function save(data) {
      var deferred;
      deferred = $q.defer();
      service().update({}, data, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }
  }


})();