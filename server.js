//1. Install Node http://nodejs.org/
// from the console:
//2. npm install connect
//3. node server.js

var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(8080);
console.log("serving files on locahost:8080 from " + __dirname)