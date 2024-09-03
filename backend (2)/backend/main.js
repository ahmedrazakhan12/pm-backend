const { server: httpServer } = require('./server');
const { server: socketServer } = require('./socketserver');

// HTTP Server Port
const HTTP_PORT = process.env.PORT || 5000;

// Socket.IO Server Port
const SOCKET_IO_PORT = process.env.SOCKET_IO_PORT || 4000;

// Start the HTTP Server
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server is running on port ${HTTP_PORT}`);
});

// Start the Socket.IO Server
socketServer.listen(HTTP_PORT, () => {
  console.log(`Socket.IO server is running on port ${HTTP_PORT}`);
});


