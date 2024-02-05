#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>
#include <FS.h>
#include <WiFiManager.h>

#include <time.h>
#include "constants.h"
#include <Math.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

#define ACCESS_POINT_NAME "TAB3D"
#define MAX_CHAR_IN_ONE_COMMAND 50
#define MAX_COMMAND_IN_ONE_LIST 60

#define SERVO_COUNT 8
#define INSTRUCTIONS_COUNT 30
#define INSTRUCTIONS_WIDTH 20
#define DEBUG 0

struct station_config wifi_config;
File fsUploadFile;  // a File object to temporarily store the received file
char buf[1000];
String getContentType(String filename);  // convert the file extension to the MIME type
bool handleFileRead(String path);        // send the right file to the client (if it exists)
void handleFileUpload();                 // upload a new file to the SPIFFS
String file;

//=============================================================
// DEFINITIONS
//=============================================================
ESP8266WebServer server(80);  // Create a webserver object that listens for HTTP request on port 80

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x42, Wire);

#define SERVOMIN 150   // This is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX 600   // This is the 'maximum' pulse length count (out of 4096)
#define USMIN 600      // This is the rounded 'minimum' microsecond length based on the minimum pulse of 150
#define USMAX 2400     // This is the rounded 'maximum' microsecond length based on the maximum pulse of 600
#define SERVO_FREQ 50  // Analog servos run at ~50 Hz updates

//Char buffer to print on
char str_holder[MAX_COMMAND_IN_ONE_LIST * MAX_CHAR_IN_ONE_COMMAND];
char command_single[MAX_CHAR_IN_ONE_COMMAND];
char command_list[MAX_COMMAND_IN_ONE_LIST][MAX_CHAR_IN_ONE_COMMAND];

const char* host = "esp8266-webupdate";

uint8_t servonum = 0;

int my_scalar = 90;

int my_sequence[INSTRUCTIONS_WIDTH][INSTRUCTIONS_COUNT];  // déclarer un tableau de tableaux pour stocker les données du fichier

int neutral_position[SERVO_COUNT] = { 0, 0, 0, 0, 0, 0, 0, 0};

int top_position[SERVO_COUNT] = { 180, 180, 180, 180, 180, 180, 180, 180 };

int T = 0;

bool launchSequence = false;

char* instructions[] = { "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n" };

const char* serverIndex = "<form method='POST' action='/upload' enctype='multipart/form-data'><input type='file' name='upload'><input type='submit' value='Upload'></form>";

void handleRoot();


//=============================================================
// SETUPS
//=============================================================
void setup_serial() {
  Serial.begin(SERIAL_SPEED);
  while (!Serial) { ; }
  if (DEBUG) Serial.println("initialisation");

  delay(2000);               // Wait for grbl to initialize
  Serial.write("\r\n\r\n");  //Wakeup grbl

  delay(5000);
  Serial.flush();  // Flush startup text in serial input

  delay(500);
  Serial.write("G21 ; \n");  //specifies Metric (in comparison to Imperial)
  delay(500);
  Serial.write("G91 ; \n");  //relative coordinates
  delay(500);
  Serial.write("G28 ; \n");  //home all axis
  delay(2000);
}

String getContentType(String filename) {  // convert the file extension to the MIME type
  if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".css")) return "text/css";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".ico")) return "image/x-icon";
  else if (filename.endsWith(".gz")) return "application/x-gzip";
  return "text/plain";
}

bool handleFileRead(String path) { // send the right file to the client (if it exists)
  if (DEBUG) Serial.println("handleFileRead: " + path);
  if (path.endsWith("/")) path += "index.html";          // If a folder is requested, send the index file
  String contentType = getContentType(path);             // Get the MIME type
  String pathWithGz = path + ".gz";
  if (SPIFFS.exists(pathWithGz) || SPIFFS.exists(path)) { // If the file exists, either as a compressed archive, or normal
    if (SPIFFS.exists(pathWithGz))                         // If there's a compressed version available
      path += ".gz";                                         // Use the compressed verion
    File file = SPIFFS.open(path, "r");                    // Open the file
    size_t sent = server.streamFile(file, contentType);    // Send it to the client
    file.close();                                          // Close the file again
    if (DEBUG) Serial.println(String("\tSent file: ") + path);
    return true;
  }
  if (DEBUG) Serial.println(String("\tFile Not Found: ") + path);   // If the file doesn't exist, return false
  return false;
}

void handleFileUpload() {  // upload a new file to the SPIFFS
  if (DEBUG) Serial.println("handle file upload");
  HTTPUpload& upload = server.upload();
  if (upload.status == UPLOAD_FILE_START) {
    String filename = upload.filename;
    if (!filename.startsWith("/")) filename = "/" + filename;
    if (DEBUG) Serial.print("handleFileUpload Name: ");
    if (DEBUG) Serial.println(filename);
    fsUploadFile = SPIFFS.open(filename, "w");  // Open the file for writing in SPIFFS (create if it doesn't exist)
  } else if (upload.status == UPLOAD_FILE_WRITE) {
    if (fsUploadFile)
      fsUploadFile.write(upload.buf, upload.currentSize);  // Write the received bytes to the file
  } else if (upload.status == UPLOAD_FILE_END) {
    if (fsUploadFile) {      // If the file was successfully created
      fsUploadFile.close();  // Close the file again
      if (DEBUG) Serial.print("handleFileUpload Size: ");
      if (DEBUG) Serial.println(upload.totalSize);
      server.send(303);
      fsUploadFile.close();

      launchSequence = true;

      String filename = upload.filename;
      if (!filename.startsWith("/")) filename = "/" + filename;

      if (DEBUG) Serial.println("Reading file");

      if (DEBUG) Serial.println(filename);

      setup_text(filename);
    }
  } else {
    server.send(500, "text/plain", "500: couldn't create file");
  }
}

void setup_wifi() {

  WiFiManager wifiManager;

  wifiManager.autoConnect(ACCESS_POINT_NAME);

  if (DEBUG) Serial.println("connected to WiFi!");
}

void handleRoot() {
  server.send(200, "text/plain", "Server Connected");  // Send HTTP status 200 (Ok) and send some text to the browser/client
}

void setup_server() {
  SPIFFS.begin();  // Start the SPI Flash Files System
  MDNS.begin(host);

  server.on("/", handleRoot);


  server.on("/upload", HTTP_GET, []() {                  // if the client requests the upload page
    if (!handleFileRead("/upload.html"))                 // send it if it exists
      server.send(404, "text/plain", "404: Not Found");  // otherwise, respond with a 404 (Not Found) error
  });

  server.on(
    "/upload", HTTP_POST,  // if the client posts to the upload page
    []() {
      server.send(200);
    },                // Send status 200 (OK) to tell the client we are ready to receive
    handleFileUpload  // Receive and save the file
  );

  server.onNotFound([]() {                               // If the client requests any URI
    if (!handleFileRead(server.uri()))                   // send it if it exists
      server.send(404, "text/plain", "404: Not Found");  // otherwise, respond with a 404 (Not Found) error
  });

  server.begin();  // Actually start the server
  if (DEBUG) Serial.println("HTTP server started");
  if (DEBUG) MDNS.addService("http", "tcp", 80);
}

//============================================================
//LECTURE FICHIER TXT
//=============================================================
void setup_text(String fileName) {
  File file = SPIFFS.open(fileName, "r");
  if (!file) {
    if (DEBUG) Serial.println("Failed to open file for reading");
    return;
  } else {
    if (DEBUG) Serial.println("File successfully opened");
  }

  //int my_sequence[4][10]; // déclarer un tableau de tableaux pour stocker les données du fichier
  int i = 0;
  int j = 0;
  char char_temp[30];
  String str_temp = "";

  while (file.available()) {
    char c = file.read();


    if (c == ',') {  // si on rencontre une virgule, passer à la colonne suivante

      my_sequence[i][j] = str_temp.toInt();
      if (DEBUG){
        Serial.println("------------");
        Serial.println(i, j);
        Serial.println(str_temp);
        Serial.println(my_sequence[i][j]);
        Serial.println("------------");
      }
      str_temp = "";
      j++;

    } else if (c == '\n') {  // si on rencontre un retour à la ligne, passer à la ligne suivante
      if (DEBUG){
        Serial.print("i,j=");
        Serial.println(i,j);
        Serial.println(str_temp.toInt());
      }
      my_sequence[i][j] = str_temp.toInt();
      if (DEBUG){
        Serial.println("------------");
        Serial.println(i,j);
        Serial.println(str_temp);
        Serial.println(my_sequence[i][j]);
        Serial.println("------------");
      }
      str_temp = "";
      i++;

      j = 0;
    }

    else {  // stocker la valeur dans le tableau
      str_temp += c;
      if (DEBUG){
        Serial.print("str_temp:");
        Serial.println(str_temp);
      }
    }
  }
  
  file.close();
}

//================================================================
//SERVOS
//================================================================
void setServoAngle(int servo_id, int servo_angle) {
  double pulselen = map(servo_angle, 0, 180, 80, 600);
  pwm.setPWM(servo_id, 0, pulselen);
}

void move_servos(int angles[]) {
  if (DEBUG){
    Serial.println("angles:");
    for (int i = 0; i < SERVO_COUNT; i++) {
      Serial.print(angles[i]);
      Serial.print(",");
    }
    Serial.println("");
  }

  for (int i = 0; i < SERVO_COUNT; i++) {
    if (DEBUG){
      Serial.print("move servo ");
      Serial.print(i);
      Serial.print(" to pos ");
      Serial.println(angles[i]);
    }
    setServoAngle(i, angles[i]);
    /////////////////////////////////delay(200);
    yield();
  }
}

void setServoPulse(uint8_t n, double pulse) {
  double pulselength;

  pulselength = 1000000;      // 1,000,000 us per second
  pulselength /= SERVO_FREQ;  // Analog servos run at ~60 Hz updates
  if (DEBUG) {
    Serial.print(pulselength); 
    Serial.println(" us per period");
  }
  pulselength /= 4096;  // 12 bits of resolution
  if (DEBUG) {
    Serial.print(pulselength); 
    Serial.println(" us per bit");
  }
  pulse *= 1000000;  // convert input seconds to us
  pulse /= pulselength;
  if (DEBUG) Serial.println(pulse);
  pwm.setPWM(n, 0, pulse);
}

void setup() {
  setup_serial();
  setup_wifi();
  setup_server();
  Wire.begin(14, 12);
  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(SERVO_FREQ);  // Analog servos run at ~50 Hz updates
  pinMode(4, OUTPUT);

  delay(10);

  /*for (int k = 0; k < INSTRUCTIONS_COUNT; k++) {
    for (int j = 0; j < SERVO_COUNT; j++) {
      my_sequence[k][j] = my_sequence[k][j] * my_scalar;
    }
  }*/

  if (DEBUG) Serial.println("Go to neutral position");
  move_servos(neutral_position);
  delay(1000);
  if (DEBUG) Serial.println("inint done!");
  yield();
}

void sendServoSignal() {
  Serial.write("M4 \nG4 P0.5 \nM3 \n");
}

void loop() {

  server.handleClient();
  
  MDNS.update();
  
  if (launchSequence && T == 0) {
    if (DEBUG) Serial.println("Starting sequence !!!!!!!!!!!!");
    for (int i = 0; i < INSTRUCTIONS_WIDTH; i++) {
      sendServoSignal();
      while(!digitalRead(4));
      int my_new_sequence [SERVO_COUNT];
      for(int scale = 0; scale < 6; scale++){
        if (scale < 3){
          for(int j=0; j < SERVO_COUNT; j++){
          my_new_sequence[j] = my_sequence[i][j*3+scale];
          }
        }
        else{
          for(int j=0; j < SERVO_COUNT; j++){
            if (j >= SERVO_COUNT - 2) my_new_sequence[j] = my_sequence[i][(SERVO_COUNT-1) * 3 + scale + ((j-6)*3)];
            else my_new_sequence[j] = 0;
          }
        }
        if (DEBUG) Serial.println("I'm out Thanks god");
        move_servos(my_new_sequence);
        delay(1000);
        move_servos(neutral_position);
        delay(300);
        if (scale != 5) Serial.write("G1 X0.133 Y0 F400 \n");
        sendServoSignal();
        while(!digitalRead(4));
      }
      delay(1000);
      Serial.write("G1 X-0.66 Y0 F400 \n");
      Serial.write("G1 X0 Z0.222 F400 \n");
      yield();
    }
    Serial.write("G28 ; \n");
    delay(200);
    T++;
  }

  else {
    yield();
  }
}
