import open3d as o3d


pcd2 = o3d.io.read_point_cloud("bun_zipper.ply")

o3d.visualization.draw_geometries([pcd2])
downpcd = pcd2.voxel_down_sample(voxel_size=0.01)
o3d.visualization.draw_geometries([downpcd])
print(pcd2)

