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

app.use(bodyParser.json());
app.set('views', __dirname + '/views')
app.set('view engine', 'jade');

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
        case '/prueba':
            res.render('index',{title:'Home'});
            break;
	case '/dispositivos':
	    var sensor1 = new Object();
		sensor1.id = "1m2j3l4";
		sensor1.tipo = "outlet";
		sensor1.ubicacion = "comedor";
		sensor1.estado = 0;
		var sensor2 = new Object();
		sensor2.id = "4rfj3l4";
		sensor2.tipo = "outlet";
		sensor2.ubicacion = "pieza1";
		sensor2.estado = 0;
		var sensores = new Array();
		sensores.push(sensor1);
		sensores.push(sensor2);
		var jsensores = JSON.stringify(sensores);
		console.log(jsensores);
		res.send(jsensores);
	    break;
    default: res.sendFile( __dirname + req.params[0]); 
    }
 });

app.post(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/dispositivos':
            var nuevo = new Object();
	    nuevo.id=req.body.id;
	    nuevo.tipo=req.body.tipo;
	    console.log(JSON.stringify(nuevo));
            break;
    default: res.sendFile( __dirname + req.params[0]); 
    }
 });



console.log('Servidor corriendo');
