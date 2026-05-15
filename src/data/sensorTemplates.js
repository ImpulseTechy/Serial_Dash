export const SENSOR_TEMPLATES = [
  {
    id: 'dht11',
    name: 'DHT11 Temperature & Humidity',
    description:
      'Basic temperature and humidity sensor. Reads °C and % RH on a single data pin.',
    recommendedBaud: 9600,
    variablesPreview: ['temp', 'humidity'],
    widgets: [
      {
        type: 'number',
        title: 'Temperature',
        variableName: 'temp',
        unit: '°C',
      },
      {
        type: 'number',
        title: 'Humidity',
        variableName: 'humidity',
        unit: '%',
      },
      {
        type: 'line',
        title: 'Temperature & Humidity',
        variableNames: ['temp', 'humidity'],
      },
      {
        type: 'gauge',
        title: 'Temperature',
        variableName: 'temp',
        min: 0,
        max: 50,
        unit: '°C',
      },
      {
        type: 'gauge',
        title: 'Humidity',
        variableName: 'humidity',
        min: 0,
        max: 100,
        unit: '%',
      },
    ],
    arduinoCode: `// DHT11 Temperature & Humidity
// Library: "DHT sensor library" by Adafruit
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  Serial.println("temp,humidity");
  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t) && !isnan(h)) {
    Serial.print(t);
    Serial.print(",");
    Serial.println(h);
  }

  delay(1000);
}`,
  },
  {
    id: 'dht22',
    name: 'DHT22 Temperature & Humidity',
    description:
      'Higher-precision version of the DHT11. Wider range and decimal output for both readings.',
    recommendedBaud: 9600,
    variablesPreview: ['temp', 'humidity'],
    widgets: [
      {
        type: 'number',
        title: 'Temperature',
        variableName: 'temp',
        unit: '°C',
      },
      {
        type: 'number',
        title: 'Humidity',
        variableName: 'humidity',
        unit: '%',
      },
      {
        type: 'line',
        title: 'Temperature & Humidity',
        variableNames: ['temp', 'humidity'],
      },
      {
        type: 'gauge',
        title: 'Temperature',
        variableName: 'temp',
        min: -40,
        max: 80,
        unit: '°C',
      },
      {
        type: 'gauge',
        title: 'Humidity',
        variableName: 'humidity',
        min: 0,
        max: 100,
        unit: '%',
      },
    ],
    arduinoCode: `// DHT22 Temperature & Humidity
// Library: "DHT sensor library" by Adafruit
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  Serial.println("temp,humidity");
  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t) && !isnan(h)) {
    Serial.print(t);
    Serial.print(",");
    Serial.println(h);
  }

  delay(1000);
}`,
  },
  {
    id: 'bmp280',
    name: 'BMP280 Pressure & Temperature',
    description:
      'Barometric pressure sensor over I2C. Outputs temperature in °C and pressure in hPa.',
    recommendedBaud: 9600,
    variablesPreview: ['temp', 'pressure'],
    widgets: [
      {
        type: 'number',
        title: 'Temperature',
        variableName: 'temp',
        unit: '°C',
      },
      {
        type: 'number',
        title: 'Pressure',
        variableName: 'pressure',
        unit: 'hPa',
      },
      {
        type: 'line',
        title: 'Temperature',
        variableNames: ['temp'],
      },
      {
        type: 'line',
        title: 'Pressure',
        variableNames: ['pressure'],
      },
      {
        type: 'gauge',
        title: 'Pressure',
        variableName: 'pressure',
        min: 950,
        max: 1050,
        unit: 'hPa',
      },
    ],
    arduinoCode: `// BMP280 Pressure & Temperature (I2C)
// Library: "Adafruit BMP280 Library"
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(9600);
  Serial.println("temp,pressure");
  bmp.begin(0x76);
}

void loop() {
  float t = bmp.readTemperature();
  float p = bmp.readPressure() / 100.0F;

  Serial.print(t);
  Serial.print(",");
  Serial.println(p);
  delay(500);
}`,
  },
  {
    id: 'mpu6050',
    name: 'MPU6050 Accelerometer & Gyroscope',
    description:
      '6-axis IMU. Reads acceleration (m/s²) on X/Y/Z and rotation rate (°/s) on X/Y/Z.',
    recommendedBaud: 9600,
    variablesPreview: ['ax', 'ay', 'az', 'gx', 'gy', 'gz'],
    widgets: [
      {
        type: 'line',
        title: 'Acceleration',
        variableNames: ['ax', 'ay', 'az'],
      },
      {
        type: 'line',
        title: 'Gyroscope',
        variableNames: ['gx', 'gy', 'gz'],
      },
      {
        type: 'number',
        title: 'Accel X',
        variableName: 'ax',
        unit: 'm/s²',
      },
      {
        type: 'number',
        title: 'Accel Y',
        variableName: 'ay',
        unit: 'm/s²',
      },
      {
        type: 'number',
        title: 'Accel Z',
        variableName: 'az',
        unit: 'm/s²',
      },
    ],
    arduinoCode: `// MPU6050 6-Axis IMU (I2C)
// Library: "Adafruit MPU6050"
#include <Adafruit_MPU6050.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(9600);
  Serial.println("ax,ay,az,gx,gy,gz");
  mpu.begin();
}

void loop() {
  sensors_event_t a, g, t;
  mpu.getEvent(&a, &g, &t);

  Serial.print(a.acceleration.x); Serial.print(",");
  Serial.print(a.acceleration.y); Serial.print(",");
  Serial.print(a.acceleration.z); Serial.print(",");
  Serial.print(g.gyro.x);         Serial.print(",");
  Serial.print(g.gyro.y);         Serial.print(",");
  Serial.println(g.gyro.z);
  delay(100);
}`,
  },
  {
    id: 'hcsr04',
    name: 'HC-SR04 Ultrasonic Distance',
    description:
      'Measures distance to an object in centimeters using ultrasonic echo timing.',
    recommendedBaud: 9600,
    variablesPreview: ['distance'],
    widgets: [
      {
        type: 'number',
        title: 'Distance',
        variableName: 'distance',
        unit: 'cm',
      },
      {
        type: 'gauge',
        title: 'Distance',
        variableName: 'distance',
        min: 0,
        max: 400,
        unit: 'cm',
      },
      {
        type: 'line',
        title: 'Distance over Time',
        variableNames: ['distance'],
      },
      {
        type: 'led',
        title: 'Object Within 30 cm',
        variableName: 'distance',
        threshold: 30,
      },
    ],
    arduinoCode: `// HC-SR04 Ultrasonic Distance
#define TRIG 9
#define ECHO 10

void setup() {
  Serial.begin(9600);
  Serial.println("distance");
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  long duration = pulseIn(ECHO, HIGH, 30000);
  float distance = duration * 0.0343 / 2.0;

  Serial.println(distance);
  delay(100);
}`,
  },
  {
    id: 'ds18b20',
    name: 'DS18B20 Waterproof Temperature',
    description:
      'Digital 1-wire temperature sensor. Common for water tanks, fish tanks, soil probes.',
    recommendedBaud: 9600,
    variablesPreview: ['temp'],
    widgets: [
      {
        type: 'number',
        title: 'Temperature',
        variableName: 'temp',
        unit: '°C',
      },
      {
        type: 'gauge',
        title: 'Temperature',
        variableName: 'temp',
        min: -10,
        max: 100,
        unit: '°C',
      },
      {
        type: 'line',
        title: 'Temperature over Time',
        variableNames: ['temp'],
      },
    ],
    arduinoCode: `// DS18B20 Waterproof Temperature (1-Wire)
// Libraries: "OneWire" + "DallasTemperature"
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 2
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(9600);
  Serial.println("temp");
  sensors.begin();
}

void loop() {
  sensors.requestTemperatures();
  float t = sensors.getTempCByIndex(0);

  if (t != DEVICE_DISCONNECTED_C) {
    Serial.println(t);
  }
  delay(1000);
}`,
  },
  {
    id: 'soil-moisture',
    name: 'Soil Moisture Sensor',
    description:
      'Analog soil moisture probe. Outputs a percentage where 0 % = bone dry and 100 % = water.',
    recommendedBaud: 9600,
    variablesPreview: ['moisture'],
    widgets: [
      {
        type: 'number',
        title: 'Soil Moisture',
        variableName: 'moisture',
        unit: '%',
      },
      {
        type: 'gauge',
        title: 'Soil Moisture',
        variableName: 'moisture',
        min: 0,
        max: 100,
        unit: '%',
      },
      {
        type: 'line',
        title: 'Moisture over Time',
        variableNames: ['moisture'],
      },
      {
        type: 'led',
        title: 'Soil is Wet',
        variableName: 'moisture',
        threshold: 40,
      },
    ],
    arduinoCode: `// Capacitive / Resistive Soil Moisture
// Calibrate DRY_VALUE and WET_VALUE for your probe.
#define MOISTURE_PIN A0
#define DRY_VALUE 1023
#define WET_VALUE 300

void setup() {
  Serial.begin(9600);
  Serial.println("moisture");
}

void loop() {
  int raw = analogRead(MOISTURE_PIN);
  int pct = map(raw, DRY_VALUE, WET_VALUE, 0, 100);
  pct = constrain(pct, 0, 100);

  Serial.println(pct);
  delay(500);
}`,
  },
  {
    id: 'photoresistor',
    name: 'Photoresistor (LDR)',
    description:
      'Measures ambient brightness. Output rises as the room gets brighter.',
    recommendedBaud: 9600,
    variablesPreview: ['light'],
    widgets: [
      {
        type: 'number',
        title: 'Light Level',
        variableName: 'light',
      },
      {
        type: 'gauge',
        title: 'Light Level',
        variableName: 'light',
        min: 0,
        max: 1023,
      },
      {
        type: 'line',
        title: 'Light over Time',
        variableNames: ['light'],
      },
      {
        type: 'led',
        title: 'Room is Bright',
        variableName: 'light',
        threshold: 500,
      },
    ],
    arduinoCode: `// Photoresistor (LDR) on Analog Pin
#define LDR_PIN A0

void setup() {
  Serial.begin(9600);
  Serial.println("light");
}

void loop() {
  int value = analogRead(LDR_PIN);
  Serial.println(value);
  delay(200);
}`,
  },
]
