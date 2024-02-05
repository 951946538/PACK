void sendServoSignal();

char *instructions[] = { "G1 X0 Y0.0 F140 \n", "G1 X5 Y0.0 F140 \n", "G1 X5 Y5 F140 \n", "G1 X0 Y5 F140 \n", "G1 X0 Y10 F140 \n", "G28 ; \n"};

int nb_instructions = 6;

void setup() {
  Serial.begin(115200);
  //pinMode(13, OUTPUT);
  while(!Serial); // wait for serial port to connect.
  // Blink once the LED to display the sucesseful connection
  //digitalWrite(13, HIGH);
  //delay(500);
  //digitalWrite(13, LOW);

  delay(2000); // Wait for grbl to initialize
  Serial.write("\r\n\r\n"); //Wakeup grbl

  delay(5000);
  Serial.flush(); // Flush startup text in serial input

  delay(500);
  Serial.write("G21 ; \n"); //specifies Metric (in comparison to Imperial)
  delay(500);
  Serial.write("G90 ; \n"); //absolute coordinates
  delay(500);
  Serial.write("G28 ; \n"); //home all axis
  delay(2000);
  //Serial.write(instructions[0]);
}

void loop() {
  // Send g-code instructions to grbl
  for (int i=0; i<nb_instructions; i++){
    //if (Serial.available() > 0){
      Serial.write(instructions[i]); 
    //}
    delay(4000);
    //if (Serial.available() > 0){
      sendServoSignal();
    //}
  }

}

void sendServoSignal(){
  Serial.write("M4 \nG4 P2 \nM3 \n");
}
