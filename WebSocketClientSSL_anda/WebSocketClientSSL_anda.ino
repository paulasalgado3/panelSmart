/*
 * WebSocketClientSSL.ino
 *
 *  Created on: 10.12.2015
 *
 *  note SSL is only possible with the ESP8266
 *
 */

#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <WebSocketsClient.h>

#include <Hash.h>
#include <ArduinoJson.h>

ESP8266WiFiMulti WiFiMulti;
WebSocketsClient webSocket;
byte mac[6];     
String _mac;

#define USE_SERIAL Serial


void cambiarEstado(String estado){
  if(estado=="0"){
    digitalWrite(2,HIGH);
    Serial.println("apagar");
    }else if (estado=="1"){
      digitalWrite(2,LOW);
      Serial.println("prender");
    }
    enviarEstado(obtenerEstado(2));
  }
  String obtenerEstado(int io){ 
    Serial.println("estado " + (String)io + ": "  + digitalRead(io));
    return (String) digitalRead(io);
   
    } 
    void enviarEstado( String estado){
      
      webSocket.sendTXT("{\"tipo\":\"estado\",\"mensaje\":{\"id\":\"" + (String)_mac + "\",\"estado\":\""+estado+"\"}}");

      }
  
     
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {


    switch(type) {
        case WStype_DISCONNECTED:
            USE_SERIAL.printf("[WSc] Disconnected!\n");
            break;
        case WStype_CONNECTED:
            {
                USE_SERIAL.printf("[WSc] Connected to url: %s\n",  payload);
				
			    // send message to server when Connected
				  //webSocket.sendTXT("Connected");
            }
            break;
        case WStype_TEXT:
            USE_SERIAL.printf("[WSc] get text: %s\n", payload);
             StaticJsonBuffer<200> jsonBuffer;
              JsonObject& root = jsonBuffer.parseObject(payload);
              int tipo = root["tipo"];
              String mensaje = root["mensaje"];

          switch(tipo){
              case 0:

                 if(mensaje == "conectado"){
                    webSocket.sendTXT("{\"tipo\":\"registro\",\"mensaje\":{\"id\":\"" + (String)_mac + "\",\"tipo\":\"outlet\"}}");
                    enviarEstado(obtenerEstado(2));
                    }
                 Serial.println(mensaje);
              break;
              case 1:
               StaticJsonBuffer<200> jsonBuffer2;
               JsonObject& _mensaje = jsonBuffer2.parseObject(mensaje);
                String id = _mensaje["id"];
                String estado = _mensaje["estado"];
                if(_mac == id){cambiarEstado(estado);}
              break;
                         
            }

			// send message to server
			// webSocket.sendTXT("message here");
            break;
       // case WStype_BIN:
        //    USE_SERIAL.printf("[WSc] get binary length: %u\n", length);
         //   hexdump(payload, length);

            // send data to server
            // webSocket.sendBIN(payload, length);
           // break;
    }

}



void setup() {
  
    // USE_SERIAL.begin(921600);
    USE_SERIAL.begin(115200);

    //Serial.setDebugOutput(true);
    USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    


      for(uint8_t t = 4; t > 0; t--) {
          USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
          USE_SERIAL.flush();
          delay(1000);
      }

    WiFiMulti.addAP("wifi", "Prueba.1238");

    //WiFi.disconnect();
    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

   WiFi.macAddress(mac);
   _mac = String(mac[5], HEX)+String(mac[4], HEX)+String(mac[3], HEX)+String(mac[2], HEX)+String(mac[1], HEX)+String(mac[0], HEX);
   
    webSocket.beginSSL("200.5.235.62", 8443);
    webSocket.onEvent(webSocketEvent);

      // prepare GPIO2
  pinMode(2, OUTPUT);

  

}

void loop() {
    webSocket.loop();
}
