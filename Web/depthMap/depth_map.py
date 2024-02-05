import argparse
import os

import numpy as np
import onnxruntime as ort
from PIL import Image


from fastai.vision.all import *
import sys

import pathlib 

plt = platform.system() 

""" Trained model on Windows wich creates path problem to read the model"""
if plt == 'Windows': 
    pathlib.PosixPath = pathlib.WindowsPath 
elif plt == 'Linux' : pathlib.WindowsPath = pathlib.PosixPath

net_w = 512
net_h = 512


DIR_PATH = os.path.dirname(os.path.realpath(__file__))
MODEL_PATH = os.path.join(DIR_PATH, '/model/model.quant.onnx')

class DepthMap:
    def __init__(self):
        self.sess = ort.InferenceSession(os.path.abspath(os.path.dirname(__file__)) + '/model/model.quant.onnx')

    def prepare_input(self, image: Image):
        width, height = image.size
        img_input = image.resize((net_w, net_h))
        img_input = np.asanyarray(img_input) / 255.0
        img_input = img_input.transpose((2, 0, 1))
        img_input = img_input.reshape(1, 3, net_h, net_w)
        img_input = img_input.astype(np.float32)
        return img_input, (width, height)

    def predict(self, img_input: np.ndarray):
        out = self.sess.run(None, {'input': img_input})
        return out[0]

    def post_process(self, depth, width, height):
        depth = np.array(depth).reshape(net_h, net_w)
        depth = Image.fromarray(depth)
        depth = depth.resize((width, height), Image.BICUBIC)
        depth = np.asanyarray(depth)

        depth_min = depth.min()
        depth_max = depth.max()

        bits = 2
        max_val = (2**(8*bits))-1

        if depth_max - depth_min > np.finfo("float").eps:
            out = max_val * (depth - depth_min) / (depth_max - depth_min)
        else:
            out = np.zeros(depth.shape, dtype=depth.type)
        return out

    def __call__(self, img: Image):
        img_input, (width, height) = self.prepare_input(img)
        depth = self.predict(img_input)
        out = self.post_process(depth, width, height)
        return out
    

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str, required=True)
    parser.add_argument('--output', type=str, required=True)
    return parser.parse_args()


def slidingCompare(arr,threshold=0.5,footprint=[5, 5]):
    """ 
    arr : the array we want to check
    treshold : différence max 
    footprint : distance en x et en y des elements du tableau a comparer
    """
    import numpy as np

    assert footprint[0] % 2 == 1, "Footprint dimensions should be odd. "
    assert footprint[0] % 2 == 1, "Footprint dimensions should be odd. "
    
    temp_arr = np.full((arr.shape[0] + footprint[0] - 1, 
                        arr.shape[1] + footprint[1] - 1), np.nan)
    temp_arr[footprint[0] // 2:footprint[0] // 2 + arr.shape[0],
             footprint[1] // 2:footprint[1] // 2 + arr.shape[1]] = arr
    
    # Arrays for the row and col indices
    i_all, j_all = np.mgrid[-(footprint[0] // 2):arr.shape[0]+(footprint[0] // 2), 
                            -(footprint[1] // 2):arr.shape[1]+(footprint[1] // 2)]

    # Footprint around the current element (ie looking at the 8 elements around the central value). Must be odd.
    footprint_size = np.product(footprint)

    # Prepare output for i and j indices
    output_i = np.full((footprint_size, *arr.shape), np.nan)
    output_j = np.full((footprint_size, *arr.shape), np.nan)

    output_ix = np.arange(footprint_size).reshape(footprint)
    
    for vert_pos in np.arange(footprint[0]):
        for horiz_pos in np.arange(footprint[1]):
            neighbour = temp_arr[vert_pos: vert_pos + arr.shape[0], 
                                 horiz_pos: horiz_pos + arr.shape[1]]
            close_mask = abs(arr - neighbour) >= threshold
            
            output_i[output_ix[vert_pos, horiz_pos], close_mask] = i_all[vert_pos: vert_pos + arr.shape[0], 
                                                    horiz_pos: horiz_pos + arr.shape[1]][close_mask]
            output_j[output_ix[vert_pos, horiz_pos], close_mask] = j_all[vert_pos: vert_pos + arr.shape[0], 
                                                    horiz_pos: horiz_pos + arr.shape[1]][close_mask]
            
    return output_i, output_j





def predictAlgo( path ) :
    """
    Determines if we use IA or SLIC
    """

    Realiste = [
        "Realism",
        "Romanticism",
        "Baroque",
        "Rococo",
        "Neoclassicism",
        "High Renaissance",
        "Mannerism (Late Renaissance)"]

    dict1 = {k: 1 for k in Realiste}

    Abstrait = [
        "Impressionism",
        "Early Renaissance",
        "Expressionism",
        "Post-Impressionism",
        "Art Nouveau (Modern)",
        "Surrealism",
        "Symbolism",
        "Northern Renaissance",
        "Naïve Art (Primitivism)",
        "Abstract Expressionism",
        "Ukiyo-e",
        "Cubism",
        "Art Informel",
        "Magic Realism"]

    dict2 = {k: 0 for k in Abstrait}



    dict3 = {**dict1, **dict2}

    model = load_learner('./depthMap/model/painting_class.plk')
    name_predict = model.predict(item = path )[0] #gets model name prediction
    print(name_predict)
    return dict3[name_predict] # it will be 0 or 1




