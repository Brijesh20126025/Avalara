# Avalara Test

## Componenet Covered
`````````
1. SET & GET APIs for cache.
       
2. You can test on multiple processes. Run multiple process add cache key by using any process and access it by using any other process.
   Even you can clone the repo on different machine and run server at any port on machine and access the privously added keys on another machines.
 
 3. Mocha & Chai testing framework added
     - SET API test case added
     - GET API test case added
`````````

## Getting Started

The project is written in Typescript. So make sure typescript is installed in your system globally.

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

1. Node.js & typescript should be installed. Make sure yor are on stable internet. I am using the cloud mongo DB to store the data.

### Installing
A step by step series of examples that tell you how to get a development env running

```
1. npm install --save
2. npm install --save-dev
```

Compile the typescript to javascript. Run below command.
Below command will compile the typescript into JS(in `out` folder) and it will also run the test cases (Mocha & chai test cases.)
Below command will automatically start the server so no need to start the server again explicitly.

```
1. `npm run start` (it will run test cases + will start the server on 2 different port(3000 & 5000).
```
## Running the server on different port manually.
If you want to run server on some different port then run - 
```
PORT=1234 node out/app.js
```

SET API CURL - 
`````````
curl -X POST \
  http://localhost:3000/api/v1/set/you_key_here \
  -H 'cache-control: no-cache' \
  -H 'postman-token: 240cb825-645d-74a6-caaa-fe9ba5aa2f9c' \
  -d your_key_value
  `````````
  
 GET API CURL - 
 ````````
curl -X GET \
  http://localhost:5000/api/v1/get/you_key_here \
  -H 'cache-control: no-cache' \
  -H 'postman-token: ff5e1912-62e1-626f-c4ef-8b1ec7c40de4'
  `````````````````
 

## Implementation Logic

I am using the MongoDB atlas free(256MB) cloud storage to store the cache data.
Every Node.js process during the process intialization they will fetch the data from cache server and will create 
in-memory cache. If any API request for get will be made first the code will check if the key is already available in process's in-memory or not if it's
available in in-memory then it will be served from in-memory cache else it will hit the cache server and get the data and will store it in in-memory storage 
and send the response.

If you add any new key from any new machine or using any new process(running on different port) then every process will pull the cache server data periodically(30s) and they will update their in-memory cache.

## NOTE - CRITICAL
I have added a new database user for this project. I have set the user expiry time limit to 7 days(for security reasons). User will be deleted from database server after 7 days. Please make sure to test this code within 7 days.



