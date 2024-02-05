import open3d as o3d
import numpy as np


# depth_array , colors np_arrays
def generate_ply(depth_array, color):

    vertices = []
    # depths = depth_array_slic
    # colors = colors_pixels
    depths = depth_array

    for x in range(depths.shape[0]):
        for y in range(depths.shape[1]):
            vertices.append((float(x), float(y), depths[x][y]))

    pcd = o3d.geometry.PointCloud()

    point_cloud = np.asarray(np.array(vertices))
    pcd.points = o3d.utility.Vector3dVector(point_cloud)
    pcd.estimate_normals()
    pcd = pcd.normalize_normals()

    pcd.colors = o3d.utility.Vector3dVector(tuple(map(tuple, color / 255.0)))

    return pcd

def save_ply(pcd, output): #output en ply
    o3d.io.write_point_cloud(output, pcd)
