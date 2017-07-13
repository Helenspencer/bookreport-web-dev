(function() {
  'use strict';

  angular.module('cedarwood-common', []).factory('TagsSvc', [
  '$resource', '$q', 'ENV',

  function ($resource, $q, ENV) {

    function service(token) {
      return $resource(ENV.apiEndpoint + '/tag/:id?query=:query&userId=:userId', {}, {
        'list': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + token
          }
        },
        'get': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + token
          }
        },
        'delete': {
          'method': 'DELETE',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + token
          }
        },
        'update': {
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + token
          }
        },
        'add': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + token
          }
        }
      });
    }

    function list(token, query, userId, tagsType, currentPage, itemsperPage) {
      var deferred;
      deferred = $q.defer();
      service(token).list({'query': query, 'currentPage':currentPage, 'itemsperPage':itemsperPage}, function(resp) {
        var tagNames = [], personalTagNames = [];
        if(resp){
          resp['Tags'].forEach(function(tag){
            if(tag.Personal){
              personalTagNames.push(tag.Name);
            } else{
              tagNames.push(tag.Name);
            }
          });
        }
        if(tagsType && tagsType==='org'){
          return deferred.resolve(tagNames);
        } else if(tagsType && tagsType==='personal'){
          return deferred.resolve(personalTagNames);
        } else{
          return deferred.resolve({'PersonalTags':personalTagNames, 'OrgTags':resp});
        }
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function get(token, id) {
      var deferred;
      deferred = $q.defer();
      service(token).get({
        'id': id
      }, function(users) {
        return deferred.resolve(users);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function remove(token, id) {
      var deferred;
      deferred = $q.defer();
      service(token).delete({
        'id': id
      }, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function update(token, tag) {
      var deferred;
      deferred = $q.defer();
      if (tag.EntityID) {
        service(token).update({'id': tag.EntityID}, tag, function() {
          deferred.resolve(tag);
        }, function(err) {
          return deferred.reject(err);
        });
      }
      return deferred.promise;
    }

    function save(token, tags){
      var deferred;
      deferred = $q.defer();
      service(token).add({}, tags, function(resp) {
        deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    return {
      list: list,
      get: get,
      remove:remove,
      update:update,
      save:save
    };
  }]);

}).call(this);
