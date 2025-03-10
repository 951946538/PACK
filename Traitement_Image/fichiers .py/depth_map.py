import argparse
import os

import numpy as np
import onnxruntime as ort
from PIL import Image

net_w = 512
net_h = 512

DIR_PATH = os.path.dirname(os.path.realpath(__file__))
MODEL_PATH = os.path.join(DIR_PATH, 'model/model.quant.onnx')

class DepthMap:
    def __init__(self):
        self.sess = ort.InferenceSession('/Users/yosh/Desktop/integration/model.quant.onnx copy')

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

# def get_colors(image_input):
#     img = Image.open(image_input)
#     colors_pixels = np.array(img)
#     colors_pixels = colors_pixels.reshape(-1, 3)
#     return colors_pixels
    
def save_depth_array_to_npy(depth_array, output):
    np.save(output,depth_array)

def save_depth_array_to_txt(depth_array, output):
    np.savetxt(output, depth_array, delimiter=',')

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str, required=True)
    parser.add_argument('--output', type=str, required=True)
    return parser.parse_args()

