(function() {
  'use strict';

  function FileDownloadSvc($resource, $q, ENV, SessionService) {

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/file/filedownload/?userid=:userid', {}, {
        
        'get': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          },
          isArray: true
        }
      });
    }

    function get(userid) {
      var deferred;
      deferred = $q.defer();
      service().get({
        'userid': userid
      }, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    return {
      get: get
    };
  }

  FileDownloadSvc.$inject = [
  '$resource', '$q', 'ENV', 'SessionService'
  ];

  angular
  .module('app')
  .factory('FileDownloadSvc', FileDownloadSvc);
})();