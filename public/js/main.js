let socket = io.connect('http://localhost:3001');
socket.on('atata', (data) => {
	console.log(data);
});