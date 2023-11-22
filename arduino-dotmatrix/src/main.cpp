#include <Arduino.h>
#include <Wire.h>

//IO    
#define PIN_D 2
#define PIN_C 3
#define PIN_B 4
#define PIN_A 5
#define PIN_G 6
#define PIN_DI 7
#define PIN_CLK 8
#define PIN_LAT 9

void draw(int i);
void receiveEvent(int howMany);

const bool ledState[11][16][16] = {
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,true ,false,false,true ,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,true ,false,false,true ,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,true ,false,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,true ,false,false,true ,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,true ,true ,true ,true ,true ,true ,true ,false,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,true ,false,false,true ,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,true ,true ,true ,true ,true ,true ,true ,false,true ,true ,true ,false },
    { false,false,false,false,false,false,false,true ,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,false,false,true ,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,true ,false,false,true ,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,true ,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,true ,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,true ,true ,true ,true ,true ,true ,true ,false,true ,true ,true ,false },
    { false,false,false,false,false,false,false,true ,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,false,false,true ,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,true ,false,false,true ,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,true ,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,true ,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,true ,true ,true ,true ,true ,true ,true ,false,true ,true ,true ,false },
    { false,false,false,true ,false,false,false,true ,false,false,true ,true ,true ,false,true ,false },
    { false,false,true ,false,false,false,true ,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,true ,false,false,true ,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  },
  {
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,true ,false,false,false,true ,false,false,false,false,false,false,false,true ,false },
    { false,false,false,true ,false,false,false,true ,false,false,true ,true ,true ,false,true ,false },
    { false,false,false,false,true ,true ,true ,true ,true ,true ,true ,false,true ,true ,true ,false },
    { false,false,false,true ,false,false,false,true ,false,false,true ,true ,true ,false,true ,false },
    { false,false,true ,false,false,false,true ,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,true ,false,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,true ,false,false,true ,false },
    { true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,true ,false },
    { false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false }
  }
};
unsigned int lastIdx = 0;

void setup() {
	pinMode(PIN_D, OUTPUT); 
	pinMode(PIN_C, OUTPUT);
	pinMode(PIN_B, OUTPUT);
	pinMode(PIN_A, OUTPUT);
	pinMode(PIN_G, OUTPUT);
	pinMode(PIN_DI, OUTPUT);
	pinMode(PIN_CLK, OUTPUT);
	pinMode(PIN_LAT, OUTPUT);
  
  Wire.begin(8); // Arduino Uno의 I2C 주소
  Wire.onReceive(receiveEvent);
}

void loop() { 
  draw(lastIdx);
}

void receiveEvent(int howMany) {
  while (Wire.available()) {
    int value = Wire.read();
    if(value >= 0 && value < 11) {
      lastIdx = value;
    }
  }
}

void draw(int i) { 
  for (int row = 0; row < 16; row++) {
    digitalWrite(PIN_A, row & 0x01); // 2^0 = 1, 0idx bit
    digitalWrite(PIN_B, row & 0x02); // 2^1 = 2, 1idx bit
    digitalWrite(PIN_C, row & 0x04); // 2^2 = 4, 2idx bit
    digitalWrite(PIN_D, row & 0x08); // 2^3 = 8, 3idx bit

    for (int col = 0; col < 16; col++) {
      // 데이터를 시프트 레지스터로 전송
      digitalWrite(PIN_DI, ledState[i][row][col] ? LOW : HIGH);
      
      // 클럭을 켰다 꺼서 데이터 비트를 시프트 -> 다음 저장 공간(도트)로 이동
      digitalWrite(PIN_CLK, HIGH);
      digitalWrite(PIN_CLK, LOW); 
    }

    // 레치를 켰다 꺼서 레지스터 출력을 업데이트
    digitalWrite(PIN_LAT, HIGH);
    digitalWrite(PIN_LAT, LOW); 

    // 출력 재활성
    digitalWrite(PIN_G, LOW);
    delay(1);
    digitalWrite(PIN_G, HIGH);
  }
}