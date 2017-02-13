var fs = require('fs');
var https = require('https');
//var WebSocketServer = require('ws').Server;
var express = require("express");
var bodyParser = require("body-parser");

var serverConfig = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
};

var app = express();
var HTTPS_PORT = 8443;

var httpsServer = https.createServer(serverConfig, app).listen(HTTPS_PORT);

//var wss = new WebSocketServer({server: httpsServer});

//wss.on('connection', function(ws) {
//    ws.on('message', function(message) {
//        wss.broadcast(message);
//    });
//});

//wss.broadcast = function(data) {
//    for(var i in this.clients) {
//        this.clients[i].send(data);
//    }
//};

app.get(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/prueba.html':
            res.send("prueba ok");
            break;
    default: res.sendFile( __dirname + req.params[0]); 
    }
 });

console.log('Servidor corriendo');
