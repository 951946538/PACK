from PIL import Image
import numpy as np

def resize_depth_map(depth_map, largeur, longueur, hauteur):
    depth_array_crop = np.array(Image.fromarray(depth_map).resize((largeur, longueur), Image.NEAREST))
    depth_array_resized = (depth_array_crop / depth_array_crop.max()) * hauteur

    return depth_array_resized

