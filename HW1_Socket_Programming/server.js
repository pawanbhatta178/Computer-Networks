const net = require("net");

const PORT = 5000;

const server = net.createServer((socket) => {
  console.log("Client connected:", socket.remoteAddress, socket.remotePort);

  let buffer = "";

  socket.on("data", (data) => {
    buffer += data.toString(); // accumulate into buffer
    // Split on delimiter
    let parts = buffer.split("\n");
    buffer = parts.pop(); // save incomplete part for next time

    for (const part of parts) {
      if (!part.trim()) continue; // skip empty lines
      try {
        const msg = JSON.parse(part);
        const recvTime = Date.now();

        console.log(`Received seq=${msg.seq} at ${recvTime}`);

        // Send acknowledgment back (also newline-delimited)
        const ack = JSON.stringify({
          ...msg,
          recvTime,
        });
        socket.write(`ACK: ${ack}\n`);
      } catch (e) {
        console.error("Invalid message:", part);
      }
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
