(function() {
  'use strict';

  function FileAuditSvc($resource, $q, ENV, SessionService) {

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/file-audit/:id/?folderId=:folderId&projectId=:projectId&ps=:ps', {}, {
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
        }
      });
    }

    function list(folderId, projectId, fileId, pageSize) {
      var deferred;
      deferred = $q.defer();
      service().list({folderId:folderId, projectId:projectId, ps: pageSize}, function(resp) {
        return deferred.resolve(resp);
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
      }, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    return {
      list: list,
      get: get
    };
  }

  FileAuditSvc.$inject = [
  '$resource', '$q', 'ENV', 'SessionService'
  ];

  angular
  .module('app')
  .factory('FileAuditSvc', FileAuditSvc);
})();