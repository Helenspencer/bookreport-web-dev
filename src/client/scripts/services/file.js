(function () {
    'use strict';

    /*
     @ngdoc service
     @name app.LibrarySvc
     @description
     LibrarySvc
     Service in the app.
     */
    angular.module('app').factory('FileSvc', FileSvc);

    FileSvc.$inject = [
        '$resource', '$q', 'ENV', 'SessionService', '$window'
    ];


    function FileSvc($resource, $q, ENV, SessionService, $window) {

        return {
            downloadAsArchive: downloadAsArchive,
            save: save,
            downloadFile: downloadFile,
            remove: remove,
            get: get,
            getUploadProgress: getUploadProgress,
            reProcess: reProcess,
            getFileDocument: getFileDocument
        };

        function service() {
            var token;
            token = SessionService.getToken() || null;
            return $resource(ENV.apiEndpoint + '/file/:id/?fileId=:fileId', {}, {
                'get': {
                    'method': 'GET',
                    'headers': {
                        'Authorization': token.value
                    }
                },
                'save': {
                    'method': 'PUT',
                    'headers': {
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

        function documentService() {
            var token;
            token = SessionService.getToken() || null;
            return $resource(ENV.apiEndpoint + '/document/:id/?fileId=:fileId', {}, {                
                'get': {
                    'method': 'GET',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': token.value
                    }
                }
            });
        }

        function reProcessService(fileId) {
            var token;
            token = SessionService.getToken() || null;
            return $resource(ENV.apiEndpoint + '/file/' + fileId + '/reprocess', {}, {
                'post': {
                    'method': 'POST',
                    'headers': {
                        'Authorization': token.value
                    }
                }
            });
        }

        function progressService(uuid) {
            return $resource(ENV.apiEndpoint.replace('/api', '') + '/progress/:id/', {}, {
                'get': {
                    'method': 'GET',
                    'headers': {
                        'X-Progress-ID': uuid
                    }
                }
            });
        }

        function downloadAsArchive(fileIds) {
            var deferred;
            deferred = $q.defer();
            service().get({
                'fileIds': $window.encodeURIComponent(fileIds.join(','))
            }, null, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function downloadFile(id) {
            var deferred;
            deferred = $q.defer();
            service().get({
                'id': id
            }, null, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function get(id) {
            var deferred;
            deferred = $q.defer();
            service().get({
                'id': id, 'fileId': id
            }, null, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function save(file) {
            var deferred;
            deferred = $q.defer();
            service().save({
                'id': file.EntityID

            }, file, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function remove(id) {
            var deferred;
            deferred = $q.defer();
            service()['delete']({
                'id': id
            }, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function getUploadProgress(file) {
            var deferred;
            deferred = $q.defer();
            progressService(file.uuid)['get']({}, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function reProcess (id) {
            var deferred;
            deferred = $q.defer();
            reProcessService(id)['post']({}, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function getFileDocument(fileId){
            var deferred;
            deferred = $q.defer();

            documentService().get({'fileId': fileId}, {}, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }
    }
})();