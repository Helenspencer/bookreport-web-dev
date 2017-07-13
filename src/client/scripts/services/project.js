(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.ProjectSvc
   @description
   ProjectSvc
   Service in the app.
   */
   angular.module('app').factory('ProjectSvc', ProjectSvc);

   ProjectSvc.$inject = [
   '$resource', '$q', 'ENV', 'SessionService'
   ];


   function ProjectSvc($resource, $q, ENV, SessionService) {

    return {      
      save: save,
      list: list,
      get: get,
      remove: remove,
      getTypes: getTypes,
      saveType: saveType,
      getType: getType,
      removeType: removeType
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/project/:id', {}, {
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
        'list': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          },
          'isArray': true
        },
        'invite': {
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

function typeService() {
  var token;
  token = SessionService.getToken() || null;
  return $resource(ENV.apiEndpoint + '/project/type/:id', {}, {
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
    'delete': {
      'method': 'DELETE',
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': token.value
      }
    }
  });
}

function populateNewFileFlag(project) {      
  if (project.Files) {
    project.Files.forEach(function(file) {
      if (file.CreatedDate) {
        if (moment().utc().isSame(moment(file.CreatedDate), 'day')) {
          file.IsNewFile = true;
        }
      }
    });
  }  
}

function save(data) {
  var deferred;
  deferred = $q.defer();
  var project = angular.copy(data);
  if(project.StartDate){
    project.StartDate=moment(project.StartDate).format('MM-DD-YYYY');
  }
    
  if (project.EntityID) {
    service().update({'id': project.EntityID}, project, function(resp) {
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
  } else {
    service().create({}, project, function(resp) {
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
  }

  return deferred.promise;
}

function list() {
  var deferred;
  deferred = $q.defer();
  service().list({}, function(projects) {
    return deferred.resolve(projects);
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
  }, function(item) {
    item.Type=1;
    populateNewFileFlag(item);
    return deferred.resolve(item);
  }, function(err) {
    return deferred.reject(err);
  });
  return deferred.promise;
}

function remove(id) {
  var deferred;
  deferred = $q.defer();
  service().delete({
    'id': id
  }, function(item) {
    return deferred.resolve(item);
  }, function(err) {
    return deferred.reject(err);
  });
  return deferred.promise;
}

function getTypes() {
  var deferred;
  deferred = $q.defer();
  typeService().list({}, function(projects) {
    return deferred.resolve(projects);
  }, function(err) {
    return deferred.reject(err);
  });
  return deferred.promise;
} 

function saveType(data) {
  var deferred;
  deferred = $q.defer();
  var type = angular.copy(data);
  var milestones = [];
  if(type.Milestones){
    type.Milestones.forEach(function(item){
      if(item.NewRow){
        delete item.NewRow;
      }
      if(item.Name){
        if(!item.EstimatedDuration){
          item.EstimatedDuration = 1;
        } 
        milestones.push(item);
      }
    });
  }
  type.Milestones = milestones;
  if (type.EntityID) {
    typeService().update({'id': type.EntityID}, type, function(resp) {
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
  } else {
    typeService().create({}, data, function(resp) {
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
  }

  return deferred.promise;
}   

function getType(id) {
  var deferred;
  deferred = $q.defer();
  typeService().get({
    'id': id
  }, function(item) {    
    return deferred.resolve(item);
  }, function(err) {
    return deferred.reject(err);
  });
  return deferred.promise;
}

function removeType(id) {
  var deferred;
  deferred = $q.defer();
  typeService().delete({
    'id': id
  }, function(item) {
    return deferred.resolve(item);
  }, function(err) {
    return deferred.reject(err);
  });
  return deferred.promise;
}

}


})();