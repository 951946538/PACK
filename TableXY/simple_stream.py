import serial
import time

try : 
    # Open grbl serial port
    s = serial.Serial('/dev/tty.usbmodem21301',115200)

    # Open g-code file
    f = open('/Users/arthur/Documents/TelecomParis/PACT/pact43/TableXY/created_gcode.gcode','r');


    # Wake up grbl
    s.write(str.encode('\r\n\r\n'))
    time.sleep(2)   # Wait for grbl to initialize 
    s.flushInput()  # Flush startup text in serial input
    # Stream g-code to grbl
    string = ""
    i = 0
    if (1):
        for line in f:
            l = line # Strip all EOL characters for consistency
            #print ('Sending: ' + l )
            i += 1
            if (i <= 3):
                string += (l)
            else :
                string += (l 
                        + "M4" + ' \n' 
                        + "G4 P2" + ' \n'
                        + "M3" + '\n')
                        
                        

            #s.write(str.encode(l + '\n' + "M4" + '\n' + "G4 P2" + '\n' + "M3" + '\n' + "G4 P2" + '\n')) # Send g-code block to grbl
            #grbl_out = s.readline() # Wait for grbl response with carriage return
            #print (str.encode(' : ') + grbl_out.strip() )
            #s.write(str.encode("G4 P2" + '\n'))
            #s.write(str.encode("M4" + '\n')) #SpnDir = 1
            #s.write(str.encode("G4 P1" + '\n'))
            #s.write(str.encode("M3" + '\n')) #SpnDir = 0
            #s.write(str.encode("G4 P1" + '\n'))
            # Wait here until grbl is finished to close serial port and file.
            if (i % 3) == 0:
                print("Ligne = " + str(i))
                print(string)
                s.write(str.encode(string))
                grbl_out = s.readline() # Wait for grbl response with carriage return
                print (str.encode(' : ') + grbl_out.strip() )
                string = ""
                input("  Press <Enter> when finished") 
    #s.write(str.encode(string))
    #print(string)
    #s.write(str.encode(string + '\n'))
    grbl_out = s.readline() # Wait for grbl response with carriage return
    print (str.encode(' : ') + grbl_out.strip() )
    s.write(str.encode("G28; + '\n"))
    input("  Press <Enter> to exit and disable grbl.") 
    # Close file and serial port
    f.close()  
    s.close()  
except serial.serialutil.SerialException:
  print ("exception")



