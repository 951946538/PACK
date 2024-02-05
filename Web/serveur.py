import socket

server = socket.socket( socket.AF_INET, socket.SOCK_STREAM)
server.bind(('localhost', 1002))
server.listen()
client_socket, client_address = server.accept() #argument number of listener



""" on receupere l'extension """
ext = client_socket.recv(3).decode("utf-8")

file = open("./result." + ext ,"wb")

image_chunk = client_socket.recv(2048)

while image_chunk:
    file.write(image_chunk)
    image_chunk = client_socket.recv(2048)


print("done")

file.close()
client_socket.close()