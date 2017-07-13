# cedarwood-web
The web UI code for the Cedarwood system

Dependency:
---------------------------------
1. npm
2. grunt
3. bower
4. Install compass from here: http://compass-style.org/install/

Development Setup
----------------------------------
1. Checkout source
2. cd {PROJECT_ROOT}/src
3. Run "npm install"
4. Run "bower install"
5. Connecting to API server
	- For connecting to Apiary mock API, set the following property in src/grunt/ngconstant.js under dev/constants/ENV
	  apiEndpoint: 'http://private-ae6fd-cedarwood.apiary-mock.com'

	- For connecting to local docker containers:
		* set your system IP address in src/grunt/connect.js under proxies/host
	  	* set the following property in src/grunt/ngconstant.js under dev/constants/ENV
	  		apiEndpoint: '/api'	  	
		* Checkout the cedarwood-backend repository
		* Run cedarwood-backend/src/build_all.sh
		* Run cedarwood-backend/src/run_all.sh as suggested by the script file.
		  Note: You need to provide your system IP address as an input to the run-all.sh script

	Note: At any point you can connect to only one API server and every time you switch between the API servers, grunt serve needs to be run to pick up the changed properties.

6. Run "grunt serve" to bring up the application.
	
Note: Livereload automatically refreshes the page as you make changes in development mode.

Deployment Setup
------------------------------------
1.  Checkout source or pull latest if the project is already checkedout.
2.  cd {PROJECT_ROOT}/src
3.  Execute run.sh in the following format:
	run.sh -r <router_ip> -h <host_port> -c <container_port> -v -e <environment> -p	

Note: 

1.  By default router_ip is localhost, host_port is 9000 and container_port is 9000
2.  Use -p (pull) option to delete the local image and get latest from docker hub
3.  Use run.sh -u to know more about the usage of the script
4.  Use -e to specifiy which environment you want to run the image. By default dev is the target environment. The environment values must be specified in ng-constant.js and aliases.js when image is built. 

Environment Variables
--------------------------------------
This project uses grunt-ng-constant to manage environment variables. 

During development phase all "development" properties are copied to {PROJECT_ROOT}/src/client/scripts/config.js. 

During deploment phase all "production" properties are copied to {PROJECT_ROOT}/src/client/scripts/config.js. 

This module is integrated to the application so any constants defined in {PROJECT_ROOT}/src/Gruntfile.coffee are available in the application via "ENV" injection.

