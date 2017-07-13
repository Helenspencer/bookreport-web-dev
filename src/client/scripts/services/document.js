(function () {
    'use strict';
    angular.module('documentApp').factory('DocumentSvc', DocumentSvc);

    DocumentSvc.$inject = [
        '$resource', '$q', 'ENV'
    ];

    function DocumentSvc($resource, $q, ENV) {

        return {
            get: get,
            list: list,
            save: save,
            getFile: getFile,
            getDocumentTypes: getDocumentTypes,
            removePartyFromDocument: removeParty,
            addDocumentParty: addParty,
            getGroundTruthCorrectionHtml: getGroundTruthCorrectionHtml,
            updateGroundTruthCorrectionHtml: updateGroundTruthCorrectionHtml,
            getGroundTruthRevisionHtml: getGroundTruthRevisionHtml,
            getEditablePageContent: getEditablePageContent,
            updateHOCRContent: updateHOCRContent,
            saveFile: saveFile,
            getUserProfile : getUserProfile
        };

        function service(token) {
            return $resource(ENV.apiEndpoint + '/document/:id/?fileId=:fileId', {}, {
                'list': {
                    'method': 'GET',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + token
                    },
                    'isArray': true
                },
                'get': {
                    'method': 'GET',
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
                },
                'update': {
                    'method': 'PUT',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + token
                    }
                }
            });
        }

        function fileService(token) {
            return $resource(ENV.apiEndpoint + '/file/?fileId=:id/', {}, {
                'get': {
                    'method': 'GET',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + token
                    }
                },
                'save': {
                    'method': 'PUT',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + token
                    }
                }
            });
        }

        function documentTypesService(token) {
            return $resource(ENV.apiEndpoint + '/document/type', {}, {
                'list': {
                    'method': 'GET',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + token
                    },
                    'isArray': true
                }
            });
        }

        function documentPartyService(token) {
            return $resource(ENV.apiEndpoint + '/document/documentparty/:id', {}, {
                'delete': {
                    'method': 'DELETE',
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

        function documentGroundTruthService(token) {
            return $resource(ENV.apiEndpoint + '/document/groundTruth/:fileId/:groundTruthItemId', {}, {
                'get': {
                    'method': 'GET',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + token
                    }
                },
                'post': {
                    'method': 'POST',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + token
                    }
                }
            });
        }

        function documentEditableContentService(token) {
            return $resource(ENV.apiEndpoint + '/document/searchablePdfPage/:fileId/:pageNumber', {}, {
                'get': {
                    'method': 'GET',
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
                }
            });
        }


        function documentGroundTruthRevisionService(token) {
            return $resource(ENV.apiEndpoint + '/document/groundTruth/:fileId/:groundTruthItemId/:revisionEntityId', {}, {
                'get': {
                    'method': 'GET',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + token
                    }
                }
            });
        }

        function userService(token) {
            return $resource(ENV.apiEndpoint + '/user/profile', {}, {
                'get': {
                    'method': 'GET',
                    'headers': {
                        'Authorization': 'Basic ' + token 
                    }
                },
            });
        }

        function getUserProfile(token){
            var deferred;
            deferred = $q.defer();

            userService(token).get({},function(users) {
                return deferred.resolve(users);
            }, function(err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function get(token, fileId) {
            var deferred;
            deferred = $q.defer();

            service(token).get({'fileId': fileId}, {}, function (resp) {
                if(resp.GroundTruthData){
                    resp.GroundTruthData.forEach(function(item, index){
                        item.PageNumber=index;
                    });
                }
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function list() {
            var deferred;
            deferred = $q.defer();
            service().list({}, function (users) {
                return deferred.resolve(users);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function getDocumentTypes(token) {
            var deferred;
            deferred = $q.defer();
            documentTypesService(token).list({}, function (users) {
                return deferred.resolve(users);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function getFile(token, id) {
            var deferred;
            deferred = $q.defer();

            fileService(token)['get']({'id': id}, {}, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function saveFile(token,file) {
            var deferred;
            deferred = $q.defer();
            fileService(token)['save']({
                'id': file.EntityID
            }, file, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function save(token, data) {
            console.log(data)
            var deferred;
            deferred = $q.defer();
            if (data.EntityID) {
                service(token).update({'id': data.EntityID}, data, function (resp) {
                    return deferred.resolve(resp);
                }, function (err) {
                    return deferred.reject(err);
                });
            } else {
                service(token).add({}, data, function (resp) {
                    return deferred.resolve(resp);
                }, function (err) {
                    return deferred.reject(err);
                });
            }

            return deferred.promise;
        }

        function removeParty(token, id) {
            var deferred;
            deferred = $q.defer();
            documentPartyService(token)['delete']({
                'id': id
            }, function (users) {
                return deferred.resolve(users);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function addParty(token, data) {
            var deferred;
            deferred = $q.defer();
            documentPartyService(token).add({}, data, function (resp) {
                return deferred.resolve(resp);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function getGroundTruthCorrectionHtml(token, id, groundTruthItemId) {
            var deferred;
            deferred = $q.defer();
            documentGroundTruthService(token)['get']({
                'fileId': id,
                'groundTruthItemId': groundTruthItemId
            }, function (response) {
                return deferred.resolve(response);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function updateGroundTruthCorrectionHtml(token, id, groundTruthItemId, newData) {
            var deferred;
            deferred = $q.defer();
            documentGroundTruthService(token)['post']({
                'fileId': id,
                'groundTruthItemId': groundTruthItemId
            }, newData, function (response) {
                return deferred.resolve(response);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function getGroundTruthRevisionHtml(token, id, groundTruthItemId, revisionEntityId) {
            var deferred;
            deferred = $q.defer();
            documentGroundTruthRevisionService(token)['get']({
                'fileId': id,
                'groundTruthItemId': groundTruthItemId,
                'revisionEntityId': revisionEntityId
            }, function (response) {
                return deferred.resolve(response);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }

        function getEditablePageContent(token,fileId, pageNumber){
            var deferred;
            deferred = $q.defer();
            documentEditableContentService(token)['get']({
                'fileId': fileId,
                'pageNumber': pageNumber
            }, function (response) {
                return deferred.resolve(response);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;   
        }

        function updateHOCRContent(token, fileId, pageNumber, data){
            var deferred;
            deferred = $q.defer();
            documentEditableContentService(token)['update']({
                'fileId': fileId,
                'pageNumber': pageNumber
            }, data , function (response) {
                return deferred.resolve(response);
            }, function (err) {
                return deferred.reject(err);
            });
            return deferred.promise;
        }
    }
})();
