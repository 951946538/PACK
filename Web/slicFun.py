import numpy as np
import cv2
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib
from skimage import io

from skimage.color import rgb2gray
from skimage.segmentation import slic, mark_boundaries
from skimage.util import img_as_float


def read_image(input):
    img_ff = img_as_float(plt.imread(input))
    return img_ff


def run_slic(img):
    region = slic(img, n_segments=250, compactness=10, sigma=1, start_label=1)
    return region

def mean_mask(img, region):
    img_mean = np.zeros_like(img)
    mean_colors = []
    for label in np.unique(region):
        mask = (region == label)
        mean_color = np.mean(img[mask], axis=0)
        mean_colors.append(mean_color)
        img_mean[mask] = mean_color
    return img_mean

def hsv_convert(img):
    img_int8 = Image.fromarray((img * 255).astype(np.uint8))
    img_int8 = np.array(img_int8, dtype=np.uint8)
    img_hsv = cv2.cvtColor(img_int8, cv2.COLOR_BGR2HSV )
    return img_hsv

def rgbtogray(img):
    depth_array = np.asarray(rgb2gray(img))
    return depth_array

def display(img, region, img_mean, depth_map):
    fig, ax = plt.subplots(2, 2, figsize=(10, 10), sharex=True, sharey=True)

    ax[0, 0].imshow(img)
    ax[0, 0].set_title("Original Image")
    ax[0, 1].imshow(mark_boundaries(img, region))
    ax[0, 1].set_title('SLIC regions')
    ax[1, 0].imshow(img_mean)
    ax[1, 0].set_title('Mean regions')
    ax[1, 1].imshow(depth_map)
    ax[1, 1].set_title('Depth Map')

    for a in ax.ravel():
        a.set_axis_off()

    plt.tight_layout()
    plt.show()


#main
def depth_map_process(path):
    img = img_as_float(plt.imread(path))
    region = slic(img, n_segments=250, compactness=10, sigma=1, start_label=1)
    img_mean = mean_mask(img, region)
    img_hsv = hsv_convert(img_mean)
    depth_map = rgbtogray(img_hsv)
    return depth_map


