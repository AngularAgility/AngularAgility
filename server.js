//1. Install Node http://nodejs.org/
// from the console:
//2. npm install
//3. node server.js
var connect = require('connect');

connect.createServer(
    connect.static(__dirname)
).listen(1337);
console.log("serving files on locahost:1337 from " + __dirname)