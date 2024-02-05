import socket

my_socket = socket.socket()

port = 5055

ip = "192.168.4.1"

my_socket.connect((ip,port))

while True:
	msg = input() + '\n'
	my_socket.send(msg.encode())