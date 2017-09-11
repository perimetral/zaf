const handler = async (socket) => {
	socket.emit('atata', {
		d: 564,
	});
	return null;
};

module.exports = handler;