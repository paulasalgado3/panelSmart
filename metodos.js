
      var xhr = new XMLHttpRequest();
      function enviarPOST(url,json){        $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: json,
      contentType: 'application/json; charset=utf-8',
      error: function (result) {
      },
      success: function (data) {
      console.log(data);
      if(data.message == "correcto"){
      switch (data.accion){
      case 'redirect':
      window.location.href = data.destino;
      break;
      case 'envio':
      break;
      case 'editar':
      document.body.innerHTML=result.responseText;
      console.log("editar");
      break;
      default:
      }
      }else{
      switch (data.accion){
      case 'redirect':
      alert('Usuario o Password incorrecto');
      break;
      default:
      window.location.href = '/';
      }
      }
      }        });
      }
      function enviarPUT(url,json){        $.ajax({
      url: url,
      type: 'PUT',
      dataType: 'json',
      data: json,
      contentType: 'application/json; charset=utf-8',
      error: function (result) {
      console.log(result);
      },
      success: function (data) {
	window.location.href = '/_panelDispositivos';
      }        });
      }
      function enviarDELETE(url,json){        $.ajax({
      url: url,
      type: 'DELETE',
      dataType: 'json',
      data: json,
      contentType: 'application/json; charset=utf-8',
      error: function (result) {
      console.log(result);
      },
      success: function (data) {
	window.location.href = '/_panelDispositivos';

	      }        });
      }

      function validarToken(){
      console.log('paso');
      var id = (document.cookie.match(/^(?:.*;)?token=([^;]+)(?:.*)?$/)||[,null])[1];
      var token = new Object();
      token.id = id;
      var jtoken = JSON.stringify(token);
      enviarPOST("https://200.5.235.62:8443/f_validarToken",jtoken);
      }
 function cambiarEstado(id,estado){
      var dispositivo = new Object();
      dispositivo.id = id ;
      dispositivo.estado = estado;
      var jdispositivo = JSON.stringify(dispositivo);
      console.log(jdispositivo);
      enviarPOST("https://200.5.235.62:8443/f_cambiarEstado",jdispositivo);
      }
      function editarConfiguracion(id){
      window.location.href = "https://200.5.235.62:8443/_editarConfiguracion?id="+id;
      }
  
      function httpGetAsync(theUrl, callback){
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      	console.log("get:" + xmlHttp.responseText);
      	callback(xmlHttp.responseText);
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous
      xmlHttp.send(null);
      }
function validarUsuario(f_usuario, f_password){
      var usuario = new Object();
      usuario.nombre = f_usuario;
      usuario.password = f_password;
      var jusuario = JSON.stringify(usuario);
      enviarPOST("https://200.5.235.62:8443/f_validarUsuario",jusuario);
      }
function modificarDispositivo(id){
      var dispositivo = new Object();
      dispositivo.id = id;
      dispositivo.tipo = document.getElementById("tiposDispositivos")[document.getElementById("tiposDispositivos").selectedIndex].value;
      dispositivo.ubicacion = document.getElementById("ubicacion").value;
      var jdispositivo = JSON.stringify(dispositivo);
      console.log(jdispositivo);
      enviarPUT("https://200.5.235.62:8443/dispositivos", jdispositivo);
      }
function regresar(path){
	window.location.href = path;
}
function desplegarOpciones(){
	var opciones = document.getElementById('opciones');
	if(opciones.rows.length==0){
		//subirConfiguracion
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.innerHTML = "Subir Configuracion";
		td.className = "nombreOpciones";
		var tdIcono = document.createElement('td');
		var input = document.createElement('input');
		input.type = "file";
		input.id = "selectFiles";
		input.style = "opacity:0;  z-index: 2; position:absolute; width: 15vw; height: 15vw";
		var buttonIcono = document.createElement('button');
		buttonIcono.className = "btnOpciones";
		buttonIcono.className += " uploadBackup";
		input.onchange = function(){ 
			 var files = document.getElementById('selectFiles').files;
  			  if (files.length <= 0) {
    				return false;
  			}
			
  			var fr = new FileReader();

  			fr.onload = function(e) { 
  			console.log(e.target.result);
  			  var result = JSON.parse(e.target.result);
    			  var formatted = JSON.stringify(result);
			   console.log(formatted);
			   var getDispositivos;
			   function devolver (disp){getDispositivos=disp;};
			   httpGetAsync("https://200.5.235.62:8443/dispositivos", getDispositivos);
			   enviarDELETE("https://200.5.235.62:8443/dispositivos",getDispositivos);
        		   enviarPOST("https://200.5.235.62:8443/dispositivos",formatted);
  }

  fr.readAsText(files.item(0));


		}; 
		tdIcono.appendChild(input);
		tdIcono.appendChild(buttonIcono);
		tr.appendChild(td);
		tr.appendChild(tdIcono);
		opciones.appendChild(tr);
		//descargarBackup
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.innerHTML = "Descargar Configuracion";
		td.className = "nombreOpciones";
		var tdIcono = document.createElement('td');
		var form = document.createElement('a');
		var d = new Date();
		form.download = "SmartPanel"+d.getDate()+d.getMonth()+d.getFullYear()+"_"+d.getHours()+d.getMinutes()+".json";
		form.href = "https://200.5.235.62:8443/dispositivos";
		var buttonIcono = document.createElement('button');
		buttonIcono.className = "btnOpciones";
		buttonIcono.className += " downloadBackup";
		form.appendChild(buttonIcono);
		tdIcono.appendChild(form);
		tr.appendChild(td);
		tr.appendChild(tdIcono);
		opciones.appendChild(tr);
		

	}else{
		while(opciones.rows.length > 0) {
 			 opciones.deleteRow(0);
		}
	}
}
function borrarDispositivo(id){
	var dispositivo = new Object();
	dispositivo.id = id;
	var jdispositivo = JSON.stringify(dispositivo);
	enviarDELETE("https://200.5.235.62:8443/dispositivos",jdispositivo);



}