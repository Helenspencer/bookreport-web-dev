(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.proposal
   @description
   proposal
   Service in the app.
   */
  angular.module('app').factory('ProposalsSvc', ProposalsSvc);

  ProposalsSvc.$inject = [
    '$resource', '$cookies', '$q', 'ENV', 'SessionService'
  ];

  function ProposalsSvc($resource, $cookies, $q, ENV, SessionService) {

    return {
      list: list,
      get: get,
      save: save,
      remove: remove
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/proposal/:id', {}, {
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
      service().list({}, function(proposals) {
        if (proposals) {
          proposals.forEach(function(item) {
            if (item.Schedules) {
              item.Schedules = item.Schedules.join(',');
            }
          });
        }
        return deferred.resolve(proposals);
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
      }, function(proposal) {
        if (proposal.Schedules) {
          proposal.Schedules = proposal.Schedules.join(',');
        }

        return deferred.resolve(proposal);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function save(data) {
      var deferred;
      deferred = $q.defer();
      var proposal = angular.copy(data);
      if (proposal.Schedules) {
        proposal.Schedules = proposal.Schedules.split(',');
        proposal.Schedules.forEach(function(item, index){
          proposal.Schedules[index]=item.trim();
        });
      } else {
        proposal.Schedules = [];
      }

      if (proposal.EntityID) {
        service().update({
          'id': proposal.EntityID
        }, proposal, function(resp) {
          return deferred.resolve(resp);
        }, function(err) {
          return deferred.reject(err);
        });
      } else {
        service().add({}, proposal, function(resp) {
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