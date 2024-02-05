'''
    Name : coordinates_to_gcode
    Author : Arthur Gastineau
    Date : 24 Jan 2023
'''

import numpy as np

width = 9.2 * 2
length = 4.85 * 2

def getDataFromFile (file):
    """
    getDataFromFile takes a file and return the data it contains

    :param file: address of the file with coordinates
    :return: array with the data
    """ 
    File_data = np.loadtxt(file, dtype = int, delimiter = ",")
    print(File_data)
    return File_data

def calculateScale (dataSize):
    """
    calculateScale takes the size of the data and return the appropriate scale

    :param dataSize: size of the data
    :return: array with the scale
    """
    xScale = round(length / dataSize[1], 5)
    yScale = round(width / dataSize[0], 5)

    return xScale, yScale

def fromDataCreateGcode (data, gcodeFile, xScale, yScale):
    """
    fromDataCreateGcode takes a 2d array and convert it to a gcode file

    :param data: 2d array corresponding to the desired XY table + depth
    :param gCodeFile: address of the file to write the gcode
    :param xScale: scale of number of motor steps for 0.5 cm on the x axis
    :param yScale: scale of number of motor steps for 0.5 cm on the y axis
    """ 

    with open(gcodeFile, "w") as f:
        f.write ("G21 ; \n") # specifies Metric (in comparison to Imperial)
        f.write ("G90 ; \n") # absolute coordinates
        f.write ("G28 ; \n") # home all axis
        # for each coordinates if the depth is not 0 make an order to go there
        for y in range (len(data)):
            for x in range (len(data[y])):
                if data[y][x] > 0:
                    f.write(f"G1 X{round(x*xScale , 5)} Y{round(y*yScale, 5)} F140 \n")
        f.write ("G28 ; \n")

if __name__ == '__main__':
    data = getDataFromFile("/Users/arthur/Documents/TelecomParis/PACT/pact43/TableXY/coordinates.txt")
    xScale, yScale = calculateScale(data.shape)
    fromDataCreateGcode(data, "/Users/arthur/Documents/TelecomParis/PACT/pact43/TableXY/created_gcode.gcode", xScale, yScale)