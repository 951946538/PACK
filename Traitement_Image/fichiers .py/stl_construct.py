# from numpy-stl import stl
from stl import mesh
import matplotlib.tri as mtri
import numpy as np




def data_flatten(depth_map, percent = 100):
    rand_ints = np.random.randint(0, 100, depth_map.shape[0])
    keep_rows = (rand_ints < percent)

    data_array = depth_map[keep_rows]

    x_data,y_data = np.meshgrid( np.arange(data_array.shape[1]), np.arange(data_array.shape[0]) )

    x_data = x_data.flatten()
    y_data = y_data.flatten()
    z_data = data_array.flatten()

    return x_data, y_data, z_data

def construction(x_data, y_data, z_data):
    triang=mtri.Triangulation(x_data, y_data)
    data = np.zeros(len(triang.triangles), dtype=mesh.Mesh.dtype)
    stl = mesh.Mesh(data, remove_empty_areas=False)
    stl.x[:] = x_data[triang.triangles]
    stl.y[:] = y_data[triang.triangles]
    stl.z[:] = z_data[triang.triangles]

    return stl


def save(stl, name):
    stl.save(name)

#main
def stl_process(depth_map):
    x_data, y_data, z_data = data_flatten(depth_map)
    stl = construction(x_data, y_data, z_data)

    save(stl, "test.stl")
