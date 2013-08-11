var http = require('http');
var express = require('express');
var holla = require('holla');

var app = express();
app.configure(function(){
  app.use(express.static(__dirname + '/demo'));
});

var port = process.env.PORT || 8080;
var server = http.createServer(app).listen(port);
var rtc = holla.createServer(server);

console.log('holla rtc started on ' + port);