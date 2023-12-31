#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <ArduinoJSON.h>
#include <SocketIOclient.h>
#include <WebSocketsClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Vector.h>

#include "secret.h"

#define ARROW_UP_BUTTON_PIN 4
#define ARROW_RIGHT_BUTTON_PIN 5
#define ARROW_DOWN_BUTTON_PIN 6
#define ARROW_LEFT_BUTTON_PIN 7
#define ARROW_SELECT_BUTTON_PIN 18

void sendMatrix(int idx);
void fetchRoomDisplayList();
JsonArray getroomDisplayList();
char* stringToChar(String str);
void handleRoomIdSelected(int idx);
void showItemSelection(Vector<String> items);
String httpGETRequest(const char* serverName);
void updateGameState(JsonObject newGameState);
void handleSocketEvent(String eventName, DynamicJsonDocument doc);
void updateLCD(int selectUnit, std::function<void(int)> onSelected);
bool asyncDelay(unsigned long* lastMilliPtr, unsigned long delayMS);
void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length);

// Create instances
WiFiMulti wiFiMulti;
SocketIOclient socketIO;
LiquidCrystal_I2C lcd(0x27, 16, 2);

// global var
bool isProjectReady = false;
unsigned long fetchLastTime = 0;
unsigned long buttonInputTime = 0;

JsonVariant gameState;
Vector<String> roomList;
Vector<String> roomDisplayList;

void setup() {
  // Serial setting
  Serial.begin(115200);
  Serial.setDebugOutput(true);

  // Pin mode Setting
  pinMode(ARROW_UP_BUTTON_PIN, INPUT); 
  pinMode(ARROW_RIGHT_BUTTON_PIN, INPUT); 
  pinMode(ARROW_DOWN_BUTTON_PIN, INPUT); 
  pinMode(ARROW_LEFT_BUTTON_PIN, INPUT); 
  pinMode(ARROW_SELECT_BUTTON_PIN, INPUT); 

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

  // I2C
  Wire.begin(8, 9);
}

void loop() {
  socketIO.loop();

  if(isProjectReady) {
    fetchRoomDisplayList();
    updateLCD(4, handleRoomIdSelected);
  }
}

void updateGameState(JsonObject newGameState) {
  serializeJson(newGameState, Serial);
  gameState = newGameState;

  sendMatrix(10 - newGameState["life"].as<int>());
}

void sendMatrix(int idx) {
  Wire.beginTransmission(8); // Arduino Uno의 I2C 주소
  Wire.write(idx); // 전송하려는 값
  Wire.endTransmission();
}

int cursorX = 0, cursorY = 0;
void updateLCD(int selectUnit, std::function<void(int)> onSelected) {
  lcd.cursor();
  for(unsigned int i = 0; i < selectUnit; i++) {
    lcd.setCursor(cursorX + i, cursorY);
  }
  if(!asyncDelay(&buttonInputTime, 200)) return;
  
  bool pressed = false;
  if(digitalRead(ARROW_UP_BUTTON_PIN) == HIGH) {
    cursorY = (cursorY + 1) % 2;
  }  
  if(digitalRead(ARROW_DOWN_BUTTON_PIN) == HIGH) {
    cursorY = cursorY - 1 < 0 ? 1 : cursorY - 1;
  }  
  if(digitalRead(ARROW_LEFT_BUTTON_PIN) == HIGH) {
    cursorX = cursorX - selectUnit < 0 ? 16 - selectUnit : cursorX - selectUnit;
  }  
  if(digitalRead(ARROW_RIGHT_BUTTON_PIN) == HIGH) {
    cursorX = (cursorX + selectUnit) % 16;
  }  
  if(digitalRead(ARROW_SELECT_BUTTON_PIN) == HIGH) {
    int idx = (cursorX + 16 * cursorY) / 4;
    onSelected(idx);
  }
}

void handleRoomIdSelected(int idx) {
  if(idx >= roomList.size()) {
    Serial.printf("[ERROR] index out of array size in handleRoomIdSelected(int idx)");
    return;
  }

  // creat JSON message for Socket.IO (event)
  DynamicJsonDocument doc(1024);
  JsonArray array = doc.to<JsonArray>();

  // add event payload
  array.add("join");
  array.add(stringToChar(roomList[idx]));

  // serialize and send
  String output;
  serializeJson(doc, output);
  socketIO.sendEVENT(output);
}

void handleSocketEvent(String eventName, DynamicJsonDocument doc) {
  if(eventName == "GAME_STARTED") {
    fetchLastTime = millis() - 5000;
    sendMatrix(0);
    Serial.println("[GAME] game started.");
  } else if(eventName == "USER_JOINED") {
    updateGameState(doc[2]);
    Serial.println("[GAME] user joined.");
  } else if(eventName == "WORD_TRIED") {
    updateGameState(doc[3]);
    Serial.println("[GAME] word tried.");
  } else if(eventName == "GAME_ENDED") {
    Serial.println("[GAME] game ended.");
    delay(1000);
    sendMatrix(0);
  }
}

void showItemSelection(Vector<String> items) {
  //render words
  for (unsigned i = 0; i < items.size(); i++) {
    lcd.printf(stringToChar(items[i]));

    if(i != 0 && (i + 1) % 4 == 0) 
    {
      lcd.setCursor(0, 1);
    }
  }
}

void fetchRoomDisplayList() {
  if(!asyncDelay(&fetchLastTime, 5000)) return;

  JsonArray roomIds = getroomDisplayList();
  size_t size = roomIds.size();
  
  String* roomStorage = new String[size];
  roomList.setStorage(roomStorage, size, 0);

  String* roomDisplayStorage = new String[size];
  roomDisplayList.setStorage(roomDisplayStorage, size, 0);

  for (unsigned i = 0; i < roomIds.size(); i++) {
    JsonVariant roomId = roomIds[i];
    String roomidStr = roomId.as<String>();
    roomList.push_back(roomidStr);
    roomDisplayList.push_back(roomidStr.substring(0, 3) + (i != roomIds.size() - 1 ? "," : ""));
  }
  lcd.clear();

  showItemSelection(roomDisplayList);
}

JsonArray getroomDisplayList() {
  String sensorReadings = httpGETRequest(stringToChar("http://"+String(SERVER_HOST)+":"+String(SERVER_PORT)+"/list"));

  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, stringToChar(sensorReadings));
  if(error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.c_str());
  }

  return doc["gameIds"].as<JsonArray>();
}

#pragma region Core

String httpGETRequest(const char* serverName) {
  WiFiClient client;
  HTTPClient http;
    
  http.begin(client, serverName);
  
  // Send HTTP POST request
  int httpResponseCode = http.GET();
  
  String payload = "{}"; 
  if (httpResponseCode > 0) {
    Serial.print("[HTTP] Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
  }
  else {
    Serial.print("[HTTP] Error code: ");
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
      isProjectReady = true;
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

      handleSocketEvent(eventName, doc);

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

#pragma endregion Core

#pragma region Utilities

char* stringToChar(String str) {
  unsigned int len = str.length() + 1;
  char* buf = new char[len];
  str.toCharArray(buf, len);
  return buf;
}

bool asyncDelay(unsigned long* lastMilliPtr, unsigned long delayMS) {
  long milli = millis();
  if(milli - *lastMilliPtr >= delayMS) {
    *lastMilliPtr = milli;
    return true;
  } else {
    return false;
  };
}

#pragma endregion Utilities
