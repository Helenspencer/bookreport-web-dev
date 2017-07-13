'use strict';

 angular.module('config', [])

.constant('ENV', {name:'ENVIRONMENT',apiEndpoint:'API_END_POINT', appHost: 'APP_HOST',debugEnabled:false, pusherKey: 'PUSHER_KEY',pusherFileEventProcessDelay: 'PUSHER_FILE_EVENT_PROCESS_DELAY'})

;