#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <ESP8266mDNS.h>
#include <WiFiManager.h> 
#include <FS.h>
#include <time.h>
#include "constants.h"
#include <Math.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

#define ACCESS_POINT_NAME "TAB3D"
#define MAX_CHAR_IN_ONE_COMMAND 50 
#define MAX_COMMAND_IN_ONE_LIST 60

#define SERVO_COUNT 5
#define INSTRUCTIONS_COUNT 20
#define DEBUG 0
//=============================================================
// DEFINITIONS
//=============================================================
ESP8266WebServer server(80);  // Create a webserver object that listens for HTTP request on port 80

WebSocketsServer webSocket = WebSocketsServer(81);
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x42,Wire);

#define SERVOMIN  150 // This is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX  600 // This is the 'maximum' pulse length count (out of 4096)
#define USMIN  600 // This is the rounded 'minimum' microsecond length based on the minimum pulse of 150
#define USMAX  2400 // This is the rounded 'maximum' microsecond length based on the maximum pulse of 600
#define SERVO_FREQ 50 // Analog servos run at ~50 Hz updates

//Char buffer to print on
char str_holder[MAX_COMMAND_IN_ONE_LIST*MAX_CHAR_IN_ONE_COMMAND];
char command_single[MAX_CHAR_IN_ONE_COMMAND];
char command_list[MAX_COMMAND_IN_ONE_LIST][MAX_CHAR_IN_ONE_COMMAND];

File logFile = SPIFFS.open(LOGFILE_PATH, "a");
//File test = SPIFFS.open("/test.txt", "r");

uint8_t servonum = 0;

int my_scalar = 1;
//180/2.7;

int my_sequence[INSTRUCTIONS_COUNT][SERVO_COUNT]; // déclarer un tableau de tableaux pour stocker les données du fichier

//int neutral_position[SERVO_COUNT] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
int neutral_position[SERVO_COUNT] = {0, 0, 0, 0, 0};

int top_position[SERVO_COUNT] = {180, 180, 180, 180, 180};

int T = 0;

//char *instructions[] = { "G1 X0 Y0.0 F140 \n", "G1 X5 Y0.0 F140 \n", "G1 X5 Y5 F140 \n", "G1 X0 Y5 F140 \n", "G1 X0 Y10 F140 \n", "G28 ; \n"};
char *instructions[] = {"G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n", "G1 X0 Y0.935 F140 \n"};



//=============================================================
// HTTP HANDLERS
//=============================================================
void handleMessageReceived(){
  /*int arg1 = server.arg("arg1").toInt();
  int arg2 = server.arg("arg2").toInt();
  int arg3 = server.arg("arg3").toInt();
  Serial.println("message received");
  server.send(200, "text/plain","Message received OK");*/
}

//=============================================================
// WEBSOCKET HANDLERS
//=============================================================
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length)
{

  Serial.printf("webSocketEvent(%d, %d, ...)\r\n", num, type);
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\r\n", num);
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\r\n", num, ip[0], ip[1], ip[2], ip[3], payload);
        // Send the current LED status
        webSocket.sendTXT(num, "Connected to ESP", strlen("Connected to ESP"));
        break;
      }


    //=============================================================================
    // Handle list like [var1,var2,var3;var1,var2,var3;...;var1,var2,var3;]
    //=============================================================================
    case WStype_TEXT:
      {
        int var1 = 0;
        int var2 = 0;
        int var3 = 0;
        
        Serial.printf("[%u] get Text: %s\r\n", num, payload);
  
        //====================================================
        //Read text and Execute Touch event
        //====================================================
        sprintf(str_holder, "%s", payload);
  
        //Check if is a list
        if( str_holder[0] != '[' or str_holder[strlen(str_holder)-1] != ']'){
          Serial.println("Not a list");
          break;
        }
  
        else{
          Serial.println("List received");
  
          int start_pos = 1;
          int stop_pos = 1;
          int count = 0;
          int command_index = 0;
          int command_count = 0;
          int max_pos = strlen(str_holder)-2; //fini par ";]"


          for(int current_pos = 1; current_pos <= max_pos;){
              start_pos = current_pos;
  
              //===================================================
              // Recherche du delimiteur de commandes
              //===================================================
              for(int i = start_pos; i <= max_pos; i++){

                  if(str_holder[i] == ';'){
                      stop_pos = i;
                      current_pos = stop_pos + 1; //point de depart de la prochaine recherche
                      
                      //===================================================
                      // On reconstitue la commande dans command_single
                      //===================================================
                      int k = 0;
                      for(int j = start_pos; j < stop_pos; j++){
                          command_single[k] = str_holder[j];
                          k++;
                      }
                      command_single[k] = '\0';
                      
                      //===================================================
                      strcpy(command_list[command_index],command_single);

                      command_index++;
                      break;
                  }
              }
              
          }
          command_count = command_index;
          
          //================================================================
          // On print le recapitulatif des commandes et on les executes
          //================================================================
          for(int i = 0; i < command_count ; i++){

              //PARSING SINGLE COMMAND
              if(sscanf(command_list[i], "%d,%d,%d", &var1, &var2 ,&var3) <= 0){
                  Serial.printf("Error parsing text for command: \n%s\n",command_list[i]);
                  webSocket.sendTXT(num, "Error parsing text!");
              }
              else{
                //PUT CALL TO FUNCTION DOING SOMETHING WITH var1,var2,var3
              }
        
          }
          
        }
  
        //====================================================
        webSocket.sendTXT(num, payload);
        
        break;
      }
    case WStype_BIN:
      Serial.printf("[%u] get binary length: %u\r\n", num, length);
      hexdump(payload, length);

      // echo data back to browser
      webSocket.sendBIN(num, payload, length);
      break;
      
    default:
      Serial.printf("Invalid WStype [%d]\r\n", type);
      break;
  }
}

//=============================================================
// SETUPS
//=============================================================
void setup_serial(){
  Serial.begin(SERIAL_SPEED);
  while (!Serial) { ; }
  if (DEBUG) Serial.println("initialisation");

  delay(2000); // Wait for grbl to initialize
  Serial.write("\r\n\r\n"); //Wakeup grbl

  delay(5000);
  Serial.flush(); // Flush startup text in serial input

  delay(500);
  Serial.write("G21 ; \n"); //specifies Metric (in comparison to Imperial)
  delay(500);
  //Serial.write("G90 ; \n"); //absolute coordinates
  Serial.write("G91 ; \n"); //relative coordinates
  delay(500);
  Serial.write("G28 ; \n"); //home all axis
  delay(2000);
}

void setup_SPIFFS(){
    if(!SPIFFS.begin()){
    if (DEBUG) Serial.println("SPIFF initialisation failed");
  }
}

void setup_wifi(){
  //WiFiManager
  //Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;
  //Uncomment to reset saved settings
  //wifiManager.resetSettings();
  
  //set custom ip for portal
  //wifiManager.setAPStaticIPConfig(IPAddress(10,0,1,1), IPAddress(10,0,1,1), IPAddress(255,255,255,0));

  //fetches ssid and pass from eeprom and tries to connect
  //if it does not connect it starts an access point with the specified name
  //and goes into a blocking loop awaiting configuration
  wifiManager.autoConnect(ACCESS_POINT_NAME);
  //or use this for auto generated name ESP + ChipID
  //wifiManager.autoConnect();

  //if you get here you have connected to the WiFi
  Serial.println("connected to WiFi!");
}

void serveAllFilesInSPIFFS(){
  Serial.println("List and serve files in SPIFFS folder:");
  Dir dir = SPIFFS.openDir("");
  int filesize = 0;
  char filename[50];
  
    while (dir.next()) {
      filesize = dir.fileSize(); //en octets
      //Put filename String in Char array needed for ServeStatic
      dir.fileName().toCharArray(filename,50); 
      Serial.print(filename);
      Serial.print(" - ");
      Serial.printf("%.2f Ko\n", filesize/1000.);
      server.serveStatic(filename, SPIFFS, filename);
    }
}

void setup_server(){
  //=============================================================
  //Pages declaration
  //=============================================================
  server.on("/message", handleMessageReceived);
  
  //=============================================================
  //Files declaration
  //=============================================================
  server.serveStatic("/", SPIFFS, "/index.html");
  server.serveStatic(LOGFILE_PATH, SPIFFS, LOGFILE_PATH);
  serveAllFilesInSPIFFS();



  //=============================================================
  // Launch server
  //=============================================================
  server.begin();
  Serial.println("HTTP server started");

  
  // Start the mDNS responder
  if (MDNS.begin(host_name)) {              
    Serial.println("mDNS responder started");
    MDNS.addService("http", "tcp", 80);
  } 
  else {
    Serial.println("Error setting up MDNS responder!");
  }
}

void setup_websocket(){
  // start webSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}



//============================================================
//LECTURE FICHIER TXT
//=============================================================
void setup_text(){
  SPIFFS.begin();
  File file = SPIFFS.open("/test.txt", "r");
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
  String str_temp="";
  
  while (file.available()) {
    char c = file.read();

    
    if (c == ',') { // si on rencontre une virgule, passer à la colonne suivante
      
      //Serial.print("i,j=");
      //Serial.println(i,j);
      
      my_sequence[i][j] = str_temp.toInt();
if (DEBUG)       Serial.println("------------");
if (DEBUG)       Serial.println(i,j);
if (DEBUG)       Serial.println(str_temp);
if (DEBUG)       Serial.println(my_sequence[i][j]);
if (DEBUG)       Serial.println("------------");
      str_temp ="";
      j++;
      
    } else if (c == '\n') { // si on rencontre un retour à la ligne, passer à la ligne suivante
      //Serial.print("i,j=");
      //Serial.println(i,j);
      //Serial.println(str_temp.toInt());
      my_sequence[i][j] = str_temp.toInt();
//      Serial.println("------------");
//      Serial.println(i,j);
//      Serial.println(str_temp);
//      Serial.println(my_sequence[i][j]);
//      Serial.println("------------");
      str_temp ="";
      i++;
      j = 0;
    } 
    
    else { // stocker la valeur dans le tableau
      str_temp+=c;
      //my_sequence[i][j] = c;
//      Serial.print("str_temp:");
//      Serial.println(str_temp);
    }
  }
  
  file.close();
}

//================================================================
//SERVOS
//================================================================
void setServoAngle(int servo_id,int servo_angle){
  double pulselen = map(servo_angle,0,180,80,600);
  pwm.setPWM(servo_id, 0, pulselen);
}

void move_servos(int angles[]) {

  //Serial.println("angles:");
  for (int i = 0; i < SERVO_COUNT; i++) {
    if (DEBUG) Serial.print(angles[i]);
    if (DEBUG) Serial.print(",");
  }
  Serial.println("");
  
  for (int i = 0; i < SERVO_COUNT; i++) {
    /*Serial.print("move servo ");
    Serial.print(i);
    Serial.print(" to pos ");
    Serial.println(angles[i]);*/
    setServoAngle(i,angles[i]);
    delay(200);
    yield();
  }
}

void setServoPulse(uint8_t n, double pulse) {
  double pulselength;
  
  pulselength = 1000000;   // 1,000,000 us per second
  pulselength /= SERVO_FREQ;   // Analog servos run at ~60 Hz updates
  //Serial.print(pulselength); Serial.println(" us per period"); 
  pulselength /= 4096;  // 12 bits of resolution
  //Serial.print(pulselength); Serial.println(" us per bit"); 
  pulse *= 1000000;  // convert input seconds to us
  pulse /= pulselength;
  //Serial.println(pulse);
  pwm.setPWM(n, 0, pulse);
}

void setup() {
  setup_serial();
  //setup_wifi();
  //setup_SPIFFS();
  //setup_server();
  //setup_websocket();
  setup_text();
  //Serial.println("8 channel Servo test!");
  Wire.begin(14, 12);
  pwm.begin();
  pwm.setOscillatorFrequency(27000000);
  pwm.setPWMFreq(SERVO_FREQ);  // Analog servos run at ~50 Hz updates

  delay(10);

  for (int k = 0; k < INSTRUCTIONS_COUNT; k++) {
    for (int j = 0; j <SERVO_COUNT; j++) {
      my_sequence[k][j] = my_sequence[k][j] * my_scalar;
    }
  }
  
  //Serial.println("Go to neutral position");
  move_servos(neutral_position);
  delay(1000);
  //Serial.println("inint done!");
  yield();

}

void sendServoSignal(){
  Serial.write("M4 \nG4 P2 \nM3 \n");
}

void loop() {
  //MDNS.update();
  //server.handleClient();
  //webSocket.loop();  
  //yield();
  // listen for incoming clients
//  WiFiClient client = server.available();
  
//  if (client) {
//    //Client handling code
//    if(client.connected())
//    {
//      Serial.println("Client Connected");
//    }
//    
//    
//    while(client.connected()){
//      String val = "";
//      while(client.available()>0)
//      {
//        // read data from the connected client
//        //byte char or -1
//       char client_message = client.read();
//       val += client_message;
//       Serial.write(val);    
//       }
//      
//      delay(10); //small delay between polling
//      
//
//    }
    
    //close the connection to the client
//    client.stop();
      
      if (T==0){
        //Serial.println(T);
       for (int i = 0; i<INSTRUCTIONS_COUNT/2;  i++){
          int val = i*2; 
          delay(2000);
          move_servos(my_sequence[val]);
          delay(1000);
          move_servos(neutral_position);
          //Serial.write(instructions[i]); 
          Serial.write("G1 X0.862 Y0 F200 \n");
          //delay(4000);
          //sendServoSignal();
          delay(2000);
          move_servos(my_sequence[val+1]);
          delay(2000);
          move_servos(neutral_position);
          if (i != (INSTRUCTIONS_COUNT-1)/2)
            //Serial.write("G1 X-0.862 Y0.935 F200 \n");
            Serial.write("G1 X-0.862 Y0 F200 \n");
            Serial.write("G1 X0 Y0.935 F200 \n");
          //delay(4000);
          yield();
        }
        Serial.write("G28 ; \n");
        delay(200);
       // move_servos(top_position);
        
      }
      
      else
      {
        //move_servos(neutral_position);
        //delay(100);
        yield();
      }
      T++;
      
 if(0){     
    // BESOIN BLOCAGE
   // move_servos(neutral_position);
   // delay(1500);
   // exit(0);
    // Drive each servo one at a time using setPWM()
    Serial.println(servonum);
    for (uint16_t pulselen = SERVOMIN; pulselen < SERVOMAX; pulselen++) {
      pwm.setPWM(servonum, 0, pulselen);
    }
  
    delay(500);
    for (uint16_t pulselen = SERVOMAX; pulselen > SERVOMIN; pulselen--) {
      pwm.setPWM(servonum, 0, pulselen);
    }
  
    delay(500);
  
    // Drive each servo one at a time using writeMicroseconds(), it's not precise due to calculation rounding!
    // The writeMicroseconds() function is used to mimic the Arduino Servo library writeMicroseconds() behavior. 
    for (uint16_t microsec = USMIN; microsec < USMAX; microsec++) {
      pwm.writeMicroseconds(servonum, microsec);
    }
  
    delay(500);
    for (uint16_t microsec = USMAX; microsec > USMIN; microsec--) {
      pwm.writeMicroseconds(servonum, microsec);
    }
  
    delay(500);
  
    servonum++;
    if (servonum > 7) servonum = 0; // Testing the first 8 servo channels
}
   


//Serial.println(T);
}

