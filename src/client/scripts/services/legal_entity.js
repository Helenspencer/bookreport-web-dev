(function() {
  'use strict';
  angular.module('documentApp').factory('LegalEntitySvc', LegalEntitySvc);

  LegalEntitySvc.$inject = [
  '$resource', '$q', 'ENV'
  ];

  function LegalEntitySvc($resource, $q, ENV) {
    return {
      get: get,
      list: list,
      save: save,
      addLegalEntityToDocument: addLegalEntityToDocument,
      getDocumentLegalEntities: getDocumentLegalEntities,
      addParty: addParty,
      loadParties: loadParties
    };

    function service(token) {            
      return $resource(ENV.apiEndpoint + '/document/legalentity/:id/?search=:search', {}, {
        'list': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          },
          'isArray': true
        },
        'get': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          }
        },
        'add': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          }
        },
        'update': {
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          }
        }
      });
    }

    function documentLegalEntityService(token) {            
      return $resource(ENV.apiEndpoint + '/document/documentlegalentity/:id?documentId=:documentId', {}, {
        'list': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          },
          'isArray': true
        },
        'get': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          }
        },
        'add': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          }
        },
        'update': {
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          }
        }
      });
    }

    function partyService(token) {            
      return $resource(ENV.apiEndpoint + '/document/party/:id', {}, {
        'list': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          },
          'isArray': true
        },
        'get': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          }
        },
        'add': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          }
        },
        'update': {
          'method': 'PUT',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          }
        }
      });
    }

    function leagalEntityPartyService(token) {            
      return $resource(ENV.apiEndpoint + '/document/legalentityparty/:id', {}, {
        'list': {
          'method': 'GET',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic '+token
          },
          'isArray': true
        }
      });
    }

    function get(token, id) {
      var deferred;
      deferred = $q.defer();    

      service(token).get({'id': id}, {}, function(resp) {       
        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }

    function list(token,search) {
     var deferred;
     deferred = $q.defer(search);
     service(token).list({'search': search}, function(resp) {
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
     return deferred.promise;
   }
   

   function save(token, data) {
    var deferred;
    deferred = $q.defer();    
    if(data.EntityID){
     service(token).update({'id': data.EntityID}, data, function(resp) {       
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
   } else{
     service(token).add({}, data, function(resp) {       
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });   
   }

   return deferred.promise;
 }

 function addLegalEntityToDocument(token,data){
  var deferred;
  deferred = $q.defer();    
  if(data.EntityID){
   documentLegalEntityService(token).update({'id': data.EntityID}, data, function(resp) {       
    return deferred.resolve(resp);
  }, function(err) {
    return deferred.reject(err);
  });
 } else{
   documentLegalEntityService(token).add({}, data, function(resp) {       
    return deferred.resolve(resp);
  }, function(err) {
    return deferred.reject(err);
  });   
 }

 return deferred.promise;
}

function getDocumentLegalEntities(token,documentId) {
     var deferred;
     deferred = $q.defer();
     documentLegalEntityService(token).list({'documentId': documentId}, function(resp) {
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
     return deferred.promise;
   }


  function addParty(token, data) {
    var deferred;
    deferred = $q.defer();    
    if(data.EntityID){
     partyService(token).update({'id': data.EntityID}, data, function(resp) {       
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
   } else{
     partyService(token).add({}, data, function(resp) {       
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });   
   }

   return deferred.promise;
 }

 function loadParties(token) {
     var deferred;
     deferred = $q.defer();
     partyService(token).list({}, function(resp) {
      return deferred.resolve(resp);
    }, function(err) {
      return deferred.reject(err);
    });
     return deferred.promise;
   }
}
})();