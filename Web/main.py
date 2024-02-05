from flask import Flask,render_template,request, redirect, url_for
import os
import open3d as o3d

from werkzeug.utils import secure_filename

from PIL import TiffImagePlugin
from PIL import Image
import base64
import io

from pathlib import Path

import requests

from urllib.request import urlopen
from urllib.error import URLError

from enum import Enum

""" import own py files """
from depthMap.depth_map import *
from slicFun import depth_map_process




app = Flask(__name__) 

script= False
filename = ''
IA = False

class algorithme(Enum):
    IA = 1
    SLIC = 2
    AUTO = 3

algo = algorithme.AUTO

""" Dimension du tableau a envoyer """
largeur = 30
longueur = 20
depthRange = 180 # define the range of value (from 0 to depthRange)

""" Parameter for the depth map continuity"""
treshold = 0.1

""" path in project """
basedir = os.path.abspath(os.path.dirname(__file__))
app.config["HOME"] = basedir 
app.config['IMAGE_UPLOADS'] = basedir + '/static/image'
app.config['TXT'] = basedir + '/static/txt'
app.config['DEPTH'] = basedir + '/static/depth'
app.config['PLY'] =  basedir + '/static/ply'


#route decorates the function
@app.route("/home", methods=['POST',"GET"])
def upload_image():
    global algo
    if request.method == "POST" :
          
        if request.form['value'] == 'SLIC':
            print("Using SLIC")
            algo = algorithme.SLIC
            return '', 204
        elif request.form['value'] == 'IA':
            print("Using IA")
            algo = algorithme.IA
            return '', 204
        elif request.form['value'] == 'AUTO':
            print("Using AUTO")
            algo = algorithme.AUTO
            return '', 204
        
        else : 

            if 'file' not in request.files :
                print(" No file given")
                return redirect(request.url)
            
            image = request.files['file']

            if image.filename == '' :
                print(" No selected file")
                return redirect(request.url) #going back to the same url
            
            
            filename = secure_filename(image.filename)
        
            image.save(os.path.join(basedir,app.config["IMAGE_UPLOADS"],filename))

            img = Image.open( app.config["IMAGE_UPLOADS"] + "/" + filename)


            data = io.BytesIO()


            file_name , file_extension = os.path.splitext(filename) 
            file_extension = file_extension[1:]
            format = 'JPEG' if(file_extension.lower() == 'jpg') else file_extension.upper()

            img.save(data, format) #on met dans le bon format pour l'envoie
            encode_img_data = base64.b64encode(data.getvalue())



            depth, depth_for_ply = process(app.config['IMAGE_UPLOADS'] + "/" + filename)
            txtPath = app.config['TXT'] + '/' + file_name + ".txt"

            """ Saving and sending depth array to arduino """
            depth = np.rint(depth).astype(int)
            np.savetxt( txtPath, depth, delimiter=',', fmt='%s') 
            sendDepthMap(txtPath)

            createPLY(file_name,file_extension, depth_for_ply, get_colors(img))

            path = os.path.join(basedir,app.config["PLY"], file_name + ".ply")

            if( os.path.getsize(path)):
                return render_template("index.html", form=False, ply=file_name, filename=encode_img_data.decode("UTF-8"), format=format)
            else :
                return render_template("index.html", form=False, filename=encode_img_data.decode("UTF-8"), format=format)


    return render_template("index.html", form = True)


@app.route("/display/<file>", methods=["GET","POST"])
def display(file = ''):
    path = '../static/ply/' + file + ".ply"
    return render_template("displayPLY.html", renderPLY=True, path=path)

    
@app.route("/error", methods=['POST',"GET"])
def error():
    return render_template("error.html")

@app.route("/propos", methods=['POST',"GET"])  
def displayPropos():
    return render_template("a-propos.html")

@app.route("/tableaux", methods=['POST',"GET"])  
def displayTableaux():
    return render_template("tableaux.html")


def internet_on(url):
    try:
        urlopen(url, timeout=1)
        return True
    except URLError as err: 
        return False


def sendDepthMap(txtFile):
    if internet_on('http://esp8266-webupdate.local/'):
        with open(txtFile, 'rb') as f: r = requests.post('http://esp8266-webupdate.local/upload', files={txtFile: f})

    else :
        print("can't connect to arduino server")
        return redirect("error")




def process(input):
    """ creating the depthMap """
    depth_map = DepthMap()
    img = Image.open(input)
    depth = depth_map(img)

    depth_for_ply = depth
    depth  = np.array(Image.fromarray(depth).resize((largeur, longueur),Image.NEAREST))
    

    """  Previous function who determines whether to use SLIC or the AI
    
    treshold = 0.1 * depth.max()
    output_i, output_j = slidingCompare(depth,treshold)

    nonan = np.count_nonzero( np.isnan(output_i ) == False) + np.count_nonzero(np.isnan(output_j ) == False)
    nan = np.count_nonzero( np.isnan(out²put_i )) + np.count_nonzero(np.isnan(output_j ) ) 
    
    pourcentage = nonan / (nonan + nan) * 100
    print( "pourcentage au dessus du treshold : " + str(pourcentage))


    """

    if(algo == algorithme.IA or algo == algorithme.AUTO and predictAlgo(input) == 1 ): #nan outside the treshold 
        print("Accept IA")
    elif(algo == algorithme.SLIC or algo == algorithme.AUTO and predictAlgo(input) == 0) :
        depth = depth_map_process(input)
        depth_for_ply = depth
        depth = np.array(Image.fromarray(depth).resize((largeur, longueur),Image.NEAREST))

    depth = (depth/ depth.max()) * depthRange # depth value between 0 and depthRage
    depth_for_ply = (depth_for_ply/ depth_for_ply.max()) * 100
    return depth, depth_for_ply
    


def get_colors(img):
    img_crop = np.array(img)
    colors_pixels_crop = img_crop.reshape(-1, 3)
    return colors_pixels_crop


def createPLY(file_name, extension, depths, color):
    """ function that process the image to create the 3D model """

    filename = file_name + '.' + extension
    vertices = []
    

    for x in range(depths.shape[0]):
        for y in range(depths.shape[1]):
            vertices.append((float(x), float(y), depths[x][y]))

    pcd = o3d.geometry.PointCloud()

    point_cloud = np.asarray(np.array(vertices))
    pcd.points = o3d.utility.Vector3dVector(point_cloud)
    pcd.estimate_normals()
    pcd = pcd.normalize_normals()

    pcd.colors = o3d.utility.Vector3dVector(tuple(map(tuple, color / 255.0)))

    o3d.io.write_point_cloud( app.config['PLY']+ '/' + file_name + ".ply",pcd)

    




if __name__ == "__main__":
    app.run(host='0.0.0.0', port='5000', debug=False)




