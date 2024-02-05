G21 ; set system to metter (10 mean 10mm)
G91 ; set to incremental ( x10 mean move 10mm on axe x)
G28 ; Go home all axes (X,Y,Z)

;Make a square 30x30mm with 1mm/cm wire
G1 X1 Y0  F70
G1 X0 Y1  F70
G1 X-1 Y0 F70
G1 X0 Y-1 F70

G28 ; Go home all axes (X,Y,Z)