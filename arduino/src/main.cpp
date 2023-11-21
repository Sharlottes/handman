#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <ArduinoJSON.h>
#include <SocketIOclient.h>
#include <WebSocketsClient.h>

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#include "secret.h"

void startGame();
void fetchRoomList();
JsonArray getRoomList();
char* stringToChar(String str);
String httpGETRequest(const char* serverName);
void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length);

// Create instances
WiFiMulti wiFiMulti;
SocketIOclient socketIO;
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  // Serial setting
  Serial.begin(115200);
  Serial.setDebugOutput(true);

  // LCD Setting
  lcd.init();
  lcd.backlight();
  lcd.begin(16, 2);

  lcd.printf("Project started."); lcd.setCursor(0, 1); lcd.printf("Loading...");

  // Connect to WiFi network connection
  Serial.printf("[SETUP] WiFi Connecting...\n");
  wiFiMulti.addAP(NETWORK_NAME, NETWORK_PASSWORD);
  while (wiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }
  Serial.printf("[SETUP] WiFi Connected %s\n", WiFi.localIP().toString().c_str());

  // Connect to WebSocket connection
  Serial.printf("[SETUP] Websocket Connecting...\n");
  socketIO.begin(SERVER_HOST, SERVER_PORT, "/socket.io/?EIO=4", IS_SERVER_SECURED ? "wss" : "ws");
  socketIO.onEvent(socketIOEvent);
}

void loop() {
  socketIO.loop();
}

void startGame() {
  fetchRoomList();
}

char* stringToChar(String str) {
    int len = str.length() + 1;
    char* buf = new char[len];
    str.toCharArray(buf, len);
    return buf;
}

const unsigned long fetchTimerDelay = 5000;

void fetchRoomList() {
  unsigned long lastTime = 0;
  while(true) {
    if ((millis() - lastTime) <= fetchTimerDelay) continue;
    lcd.clear();

    JsonArray roomIds = getRoomList();
    int i = 0;
    for(JsonVariant roomId : roomIds) {
        Serial.println(stringToChar(roomId.as<String>()));

        String roomidStr = roomId.as<String>();
        String sub = roomidStr.substring(0, 3);
        lcd.printf(stringToChar(sub + (i != roomIds.size() - 1 ? "," : "")));

        if(i != 0 && (i+1) % 4 == 0) 
        {
          lcd.setCursor(0, 1);
        }
        i++;
    }
 
    lastTime = millis();
  }
}

JsonArray getRoomList() {
  String sensorReadings;
  
  while(true) {
    sensorReadings = httpGETRequest(stringToChar("http://"+String(SERVER_HOST)+":"+String(SERVER_PORT)+"/list"));
    Serial.println(sensorReadings);

    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, stringToChar(sensorReadings));
    if(error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.c_str());
    }
    return doc["gameIds"].as<JsonArray>();
  }
}

String httpGETRequest(const char* serverName) {
  WiFiClient client;
  HTTPClient http;
    
  http.begin(client, serverName);
  
  // Send HTTP POST request
  int httpResponseCode = http.GET();
  
  String payload = "{}"; 
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
  }
  else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }

  // Free resources
  http.end();

  return payload;
}

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case sIOtype_DISCONNECT:
      Serial.printf("[IOc] Disconnected!\n");
      break;
    case sIOtype_CONNECT:
      Serial.printf("[IOc] Connected to url: %s\n", payload);
      socketIO.send(sIOtype_CONNECT, "/");

      lcd.clear(); lcd.printf("Server connected"); lcd.setCursor(0, 1); lcd.printf("Welcome to Game!");
      delay(1500);
      startGame();
      break;
    case sIOtype_EVENT:
    {
      char * sptr = NULL;
      int id = strtol((char *)payload, &sptr, 10);
      Serial.printf("[IOc] get event: %s id: %d\n", payload, id);
      if(id) {
        payload = (uint8_t *)sptr;
      }
      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, payload, length);
      if(error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.c_str());
        return;
      }

      String eventName = doc[0];
      Serial.printf("[IOc] event name: %s\n", eventName.c_str());

      // Message Includes a ID for a ACK (callback)
      if(id) {
        // creat JSON message for Socket.IO (ack)
        DynamicJsonDocument docOut(1024);
        JsonArray array = docOut.to<JsonArray>();

        // add payload (parameters) for the ack (callback function)
        JsonObject param1 = array.createNestedObject();
        param1["now"] = millis();

        // JSON to String (serializion)
        String output;
        output += id;
        serializeJson(docOut, output);

        // Send event
        socketIO.send(sIOtype_ACK, output);
      }
    }
      break;
    case sIOtype_ACK:
      Serial.printf("[IOc] get ack: %u\n", length);
      break;
    case sIOtype_ERROR:
      Serial.printf("[IOc] get error: %u\n", length);
      break;
    case sIOtype_BINARY_EVENT:
      Serial.printf("[IOc] get binary: %u\n", length);
      break;
    case sIOtype_BINARY_ACK:
      Serial.printf("[IOc] get binary ack: %u\n", length);
      break;
  }
}
