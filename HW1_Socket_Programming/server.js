const net = require("net");

const PORT = 5000;

const server = net.createServer((socket) => {
  console.log("Client connected:", socket.remoteAddress, socket.remotePort);

  socket.on("data", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log({ msg });
      const recvTime = Date.now();

      console.log(`Received seq=${msg.seq} at ${recvTime}`);

      // Send JSON acknowledgment back
      const ack = JSON.stringify({
        ...msg, //echo all client data
        recvTime,
      });
      socket.write(`ACK: ${ack}\n`);
    } catch (e) {
      console.error("Invalid message:", data.toString());
    }
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
