from PIL import Image
import numpy as np

def get_colors(image_input,largeur, longueur):
    img = Image.open(image_input)
    img_crop = np.array(img.resize((largeur, longueur), Image.NEAREST))
    colors_pixels_crop = img_crop.reshape(-1, 3)
    return colors_pixels_crop