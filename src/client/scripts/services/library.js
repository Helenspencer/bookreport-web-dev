(function() {
  'use strict';

  /*
   @ngdoc service
   @name app.LibrarySvc
   @description
   LibrarySvc
   Service in the app.
   */
  angular.module('app').factory('LibrarySvc', LibrarySvc);

  LibrarySvc.$inject = [
    '$resource', '$q', 'ENV', 'SessionService'
  ];

  function LibrarySvc($resource, $q, ENV, SessionService) {
    return {
      search: search
    };

    function service() {
      var token;
      token = SessionService.getToken() || null;
      return $resource(ENV.apiEndpoint + '/search', {}, {
        'search': {
          'method': 'POST',
          'headers': {
            'Content-Type': 'application/json',
            'Authorization': token.value
          }
        }
      });
    }
    
    function populateFolderProjectFlags(resp) { 
      if (resp.Folders) {
        resp.Folders.forEach(function(folder) {
          folder.Type = 0;
        });
      } else {
        resp.Folders = [];
      }

      if (resp.Projects) {
        resp.Projects.forEach(function(project) {
          project.Type = 1;
        });
      } else {
        resp.Projects = [];
      }

      return resp.Folders.concat(resp.Projects);
    }

    function populateNewFileFlag(results) {
      if (results) {
        results.forEach(function(project) {
          if (project.Files) {
            project.Files.forEach(function(file) {
              if (file.CreatedDate) {
                if (moment().utc().isSame(moment(file.CreatedDate), 'day')) {
                  file.IsNewFile = true;
                }
              }
            });
          }
        });
      }
    }

    function search(criteria, isProjectFilesOnly, isProjectTagsOnly) {
      var deferred;
      deferred = $q.defer();
      var query = angular.copy(criteria);

      if(!query.basic){
        delete query.basic
      }

      if (!query.Project) {

        delete query.Project;
      }

      if (!query.Name) {
        delete query.Name;
      }

      if (!query.Body) {
        delete query.Body;
      }

      if (!query.Tag) {
        delete query.Tag;
      }

      if(isProjectFilesOnly){
        query.isProjectFilesOnly = isProjectFilesOnly;
      } else {
        query.isProjectFilesOnly = false;
      }

      if(isProjectTagsOnly){
        query.isProjectTagsOnly = isProjectTagsOnly;
      }else{
        delete query.isProjectTagsOnly;
      }

      service().search({}, query, function(resp) {
        if(!isProjectTagsOnly){
          var results = populateFolderProjectFlags(resp);
          populateNewFileFlag(results);
        }

        return deferred.resolve(resp);
      }, function(err) {
        return deferred.reject(err);
      });
      return deferred.promise;
    }
  }
})();
