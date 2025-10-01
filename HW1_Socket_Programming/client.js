const net = require("net");
const fs = require("fs");
const path = require("path");

const PORT = 5000;
const HOST = process.argv[3] || "127.0.0.1"; // change to your server IP
const INTERVAL_MS = 1000; // send message every 1 second
const OUT_REQUEST_COUNT = 200;

const OUTPUT_FILE = process.argv[2] || "results.json";
if (!process.argv[2]) {
  console.log("No output file provided, defaulting to results.json");
}
const client = new net.Socket();

const results = []; // store results here
let receivedCount = 0;

// Connect to server
client.connect(PORT, HOST, () => {
  console.log("Connected to server");

  let count = 1;

  const intervalId = setInterval(() => {
    const sendTime = Date.now();
    const message = JSON.stringify({ seq: count, sendTime });

    // Send message
    client.write(message + "\n"); // append delimiter
    count++;
    if (count > OUT_REQUEST_COUNT) {
      clearInterval(intervalId);
    }
  }, INTERVAL_MS);
});
let buffer = ""; // buffer for incomplete chunks

client.on("data", (data) => {
  buffer += data.toString(); // append new chunk

  // Split on newline to handle multiple messages
  const lines = buffer.split("\n");
  buffer = lines.pop(); // save last partial line for next "data"

  for (const line of lines) {
    if (!line.trim()) continue; // skip empty lines

    try {
      const msgStr = line.replace(/^ACK: /, ""); // remove prefix
      const parsed = JSON.parse(msgStr);

      if (parsed.sendTime) {
        receivedCount++;

        const recvTimeClient = Date.now();
        const rtt = recvTimeClient - parsed.sendTime;
        const overall = { ...parsed, recvTimeClient, rtt };

        results.push(overall);

        console.log(`ACK seq=${parsed.seq} received. RTT = ${rtt} ms`);

        // Close connection after all ACKs received
        if (receivedCount >= OUT_REQUEST_COUNT) {
          console.log("Ending client");
          client.end();
        }
      } else {
        console.log("ACK:", line);
      }
    } catch (e) {
      console.error("ACK parse error:", line, e);
    }
  }
});

// Handle close
client.on("close", () => {
  console.log("Connection closed");

  // Ensure "data" directory exists
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Full path to output file in data directory
  const outputPath = path.join(dataDir, OUTPUT_FILE);

  // Write results to JSON file
  fs.writeFile(outputPath, JSON.stringify(results, null, 2), (err) => {
    if (err) {
      console.error("Error writing JSON:", err);
    } else {
      console.log(`Results written to ${outputPath}`);
    }
  });
});

// Handle errors
client.on("error", (err) => {
  console.error("Client error:", err.message);
});
