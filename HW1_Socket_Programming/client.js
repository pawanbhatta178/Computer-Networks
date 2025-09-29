const net = require("net");

const PORT = 5000;
const HOST = "127.0.0.1"; // change to your server IP
const INTERVAL_MS = 1000; // send message every 1 second

const client = new net.Socket();

// Connect to server
client.connect(PORT, HOST, () => {
  console.log("Connected to server");

  let count = 1;

  setInterval(() => {
    const sendTime = Date.now();
    const message = JSON.stringify({ seq: count, sendTime });

    // Send message
    client.write(message + "\n"); // append delimiter
    count++;
  }, INTERVAL_MS);
});

// Receive acknowledgment and compute RTT
client.on("data", (data) => {
  console.log({ data });

  const recvTimeClient = Date.now();
  const ack = data.toString().trim();

  try {
    const parsed = JSON.parse(ack.replace(/^ACK: /, ""));
    if (parsed.sendTime) {
      const rtt = recvTimeClient - parsed.sendTime;
      console.log({ ...parsed, recvTimeClient });

      console.log(`ACK received. RTT = ${rtt} ms`);
    } else {
      console.log("ACK:", ack);
    }
  } catch (e) {
    console.log("ACK (error):", ack);
  }
});

// Handle close
client.on("close", () => {
  console.log("Connection closed");
});

// Handle errors
client.on("error", (err) => {
  console.error("Client error:", err.message);
});
