(function() {
  'use strict';

  angular.module('app').factory('MilestonesSvc', MilestonesSvc);

  MilestonesSvc.$inject = [
  '$resource', '$cookies', '$q', 'ENV', 'SessionService'
  ];

  function MilestonesSvc($resource, $cookies, $q, ENV, SessionService) {

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/project/:projectId/milestone/:id/?ordinals=:ordinals', {}, {
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
        'delete': {
          'method': 'DELETE',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        }
      });
}

function weekDaysBetweenDates(startDate, endDate){
  var numberOfWeekDays = 0;

  while (!startDate.isSame(endDate, 'day')){
    startDate = startDate.add(1,'day');
    if(startDate.isoWeekday()<6){
      numberOfWeekDays +=1;
    }        
  }
    //Includes both start and end dates
    return numberOfWeekDays+1;
  }



  function list(projectId) {
    var deferred;
    deferred = $q.defer();
    service().list({'projectId': projectId}, function(milestones) {        
      return deferred.resolve(milestones);
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  }  


  function save(data) {
    var deferred;
    deferred = $q.defer();
    var milestone = angular.copy(data);
    milestone.EstimatedStartDate=moment(milestone.EstimatedStartDate).format('MM-DD-YYYY');
    milestone.EstimatedEndDate=moment(milestone.EstimatedEndDate).format('MM-DD-YYYY');
    if(milestone.ActualStartDate){
      milestone.ActualStartDate=moment(milestone.ActualStartDate).format('MM-DD-YYYY');
    }
    if(milestone.ActualEndDate){
      milestone.ActualEndDate=moment(milestone.ActualEndDate).format('MM-DD-YYYY');
      milestone.ActualDuration = weekDaysBetweenDates(moment(milestone.ActualStartDate), moment(milestone.ActualEndDate));
    }
    if (milestone.EntityID) {
      service().update({'projectId': milestone.ProjectID, 'id':milestone.EntityID}, milestone, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
    } else {
      service().add({'projectId': milestone.ProjectID}, milestone, function(resp) {
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
    }
    return deferred.promise;
  }

  function remove(projectId, id) {
    var deferred;
    deferred = $q.defer();
    service()['delete']({
      'projectId': projectId,'id': id
    }, function(resp) {
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  }

  function get(projectId, id) {
    var deferred;
    deferred = $q.defer();
    service().get({
      'projectId': projectId, 'id': id
    }, function(item) {
      return deferred.resolve(item);
    }, function(err) {
      return deferred.reject(err);
    });
    return deferred.promise;
  }

  function updateOrdinals(projectId, data){
    var deferred;
    deferred = $q.defer();
    service().update({'projectId': projectId, 'ordinals':true}, data, function(resp) {
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
     return deferred.promise;
  }

  return {
    list: list,
    save: save,
    remove: remove,
    get: get,
    updateOrdinals: updateOrdinals
  };  
}

})();