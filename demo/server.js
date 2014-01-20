//Instruction to run the demo
//1. Install Node http://nodejs.org/
// from the console/terminal in this folder run:
//2. npm install
//3. node server.js
var express = require('express');

var app = express()
app.use("/", express.static(__dirname));
app.use("/src", express.static(__dirname + "/../src"));

var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log("Serving files on locahost:1337 from " + __dirname)
})
