var fs = require('fs');
var https = require('https');
var WebSocketServer = require('ws').Server;
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
var serverConfig = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
};

var app = express();
var HTTPS_PORT = 8443;
var httpsServer = https.createServer(serverConfig, app).listen(HTTPS_PORT);

var  wss = new WebSocketServer({
	server : httpsServer,
});




app.use(bodyParser.json());
app.use(cookieParser());
app.set('views', __dirname + '/views')
app.set('view engine', 'jade');

wss.on('connection', function(wss){
	//enviar algo
	wss.send(JSON.stringify({tipo: '0', mensaje:'conectado'})); 
	wss.on('message', function incoming(message){
		var mensaje = JSON.parse(message);
		console.log(mensaje);
		switch ((JSON.parse(message)).tipo){
			case 'registro':
				var dispositivonuevo = mensaje.mensaje; 
				var yaexiste = false;
				 for (i = 0; i < dispositivos.length; i++) {
                                        if(dispositivos[i].id==mensaje.mensaje.id){
						yaexiste = true;
                		        }
                		}
				if(yaexiste == false){
				dispositivos.push(dispositivonuevo);
				}
				
			break;
			case 'estado':
				console.log(mensaje.mensaje.estado);
				for (i = 0; i < dispositivos.length; i++) {
		                        if(dispositivos[i].id==mensaje.mensaje.id){
                                		dispositivos[i].estado = mensaje.mensaje.estado;
						enviarMensaje(JSON.stringify({tipo:'3', mensaje:{id:mensaje.mensaje.id,estado:mensaje.mensaje.estado}}));
                        }
                }

			break;
			default:

		}
	});

});


function enviarMensaje(mensaje){
	wss.clients.forEach(function each(client){
		client.send(mensaje);
	});

}

//DISPOSITIVOS
		var dispositivo1 = new Object();
		dispositivo1.id = "39e0ie";
		dispositivo1.tipo = "outlet";
		dispositivo1.estado = 0;
		dispositivo1.ubicacion = "comedor";
		dispositivo1.editar = "";
		var dispositivo2 = new Object();
		dispositivo2.id = "4rfj3l4";
		dispositivo2.tipo = "outlet";
		dispositivo2.estado = 1;
		dispositivo2.ubicacion = "pieza1";
		dispositivo2.editar="";
		//prendido
		var dispositivos = new Array();
		dispositivos.push(dispositivo2);
		dispositivos.push(dispositivo1);

var sesiones = new Array();
var usuario = "admin";
var password = "1234";
var token ;
function validarUsuario (u,p){
	if(u==usuario && p==password){
		token = Math.random().toString(36).substring(7);
		sesiones.push(token);
		//buscar la forma de borrar la sesion del array cuando expire
	}else{token="incorrecto";}
	

}
function verificarExistencia(id){
	var existencia = false;
	for (i = 0; i < dispositivos.length; i++) {
                if(dispositivos[i].id == id){
                        existencia = true;
                }
            }
	return existencia;
}
// _ para paginas
// f_ para meotodos
// sin nada para respuestas rest

app.get(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
	case '/':
		res.render('login',{title:'Login'});
		res.end();
		break;
        case '/_panelDispositivos':
            res.render('panelDispositivos',{title:'Panel Dispositivos'});
		res.end();
            break;
	case '/dispositivos':
		var jdispositivos = JSON.stringify(dispositivos);
		res.send(jdispositivos);
		res.end();
	    break;
	 case '/_editarConfiguracion':
                var id = req.query.id;
                var tipo = "";
                var tipos = new Array();
                var dispositivo = new Object();
                var existe = false;
                for (i = 0; i < dispositivos.length; i++) {
                        tipo = dispositivos[i].tipo;
                                existe=false;
                                if(dispositivos[i].id == id){dispositivo = dispositivos[i]}
                                for(j = 0; j < tipos.length; j++){
                                        if(tipos[j] == tipo){existe=true}
                                }
                                if(existe==false){tipos.push(tipo)}
                }
                var jdispositivo = JSON.stringify(dispositivo);
                res.render('editarConfiguracion',{title: 'Editar Configuracion',id: id, tipos: tipos, dispositivo: dispositivo});
                res.end();
                break;
    	default: res.sendFile( __dirname + req.params[0]); 
    }
 });

app.post(/^(.+)$/, function(req, res){ 
    switch(req.params[0]) {
        case '/dispositivos':
           // var dispositivonuevo = new Object();
	   // dispositivonuevo.id=req.body.id;
	   // dispositivonuevo.tipo=req.body.tipo;
	   // dispositivos.push(dispositivonuevo);
	
	      var pdispositivos = JSON.parse(JSON.stringify(req.body));
	      pdispositivos.forEach( function (dispositivo){
		if (!verificarExistencia(dispositivo.id)){
			dispositivos.push(dispositivo);	
			}
		});
		 res.send({message: 'correcto', accion:''}); 
	    res.end();
            break;
	 case '/f_validarUsuario':
		token=null;
		validarUsuario(req.body.nombre, req.body.password);
		console.log( "login: "+ token);
                if (token!="incorrecto"){
			res.cookie('token', token, { expires: new Date(Date.now() + 900000) } );
			res.send({message: 'correcto', accion: 'redirect', destino:'/_panelDispositivos'});
		}else{
			res.send({message:'incorrecto', accion: 'redirect', destino:'/_panelDispositivos'});
		}
                res.end();
                break;
	case '/f_validarToken':
		var token_recibido = req.body.id;
		var token_existente = false;
		for (i = 0; i < sesiones.length; i++) {
			if(sesiones[i]==token_recibido){
				token_existente = true;
			}
		}
		if(token_existente==true){
			res.send({message:'correcto', accion: 'nada'});
		}else{
			res.send({message:'incorrecto', accion: 'nada'});
		}
                res.end();
                break;
	case '/f_cambiarEstado':
		var mensaje = {'id':req.body.id, 'estado': req.body.estado};
		var jmensaje = JSON.stringify(mensaje);
		var jrespuesta = ({tipo: '1',mensaje:jmensaje});
		enviarMensaje(JSON.stringify(jrespuesta));
		res.send({message:'correcto', accion: 'envio'});
		res.end();
		break;
    default: res.sendFile( __dirname + req.params[0]); 
    }
 });

app.put(/^(.+)$/, function(req, res){
    switch(req.params[0]) {
        case '/dispositivos':
            var dispositivonuevo = new Object();
	    for (i = 0; i < dispositivos.length; i++) {
		if(dispositivos[i].id == req.body.id){
			dispositivos[i].tipo = req.body.tipo;
			dispositivos[i].ubicacion = req.body.ubicacion;
		}
            }
            res.end();
            break;
	default:
	}
});

app.delete(/^(.+)$/, function(req, res){
    switch(req.params[0]) {
        case '/dispositivos':
            for (i = 0; i < dispositivos.length; i++) {
                if(dispositivos[i].id == req.body.id){
			dispositivos.splice(i,1);
                }
            }
            res.end();
            break;
        default:
        }
});

console.log('Servidor corriendo');
