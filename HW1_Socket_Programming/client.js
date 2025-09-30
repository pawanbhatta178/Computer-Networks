const net = require("net");
const fs = require("fs");
const path = require("path");

const PORT = 5000;
const HOST = "127.0.0.1"; // change to your server IP
const INTERVAL_MS = 1000; // send message every 1 second
const OUT_REQUEST_COUNT = 100;

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

// Receive acknowledgment and compute RTT
client.on("data", (data) => {
  const recvTimeClient = Date.now();
  const ack = data.toString().trim();

  try {
    const parsed = JSON.parse(ack.replace(/^ACK: /, ""));
    if (parsed.sendTime) {
      receivedCount++;

      const rtt = recvTimeClient - parsed.sendTime;
      const overall = { ...parsed, recvTimeClient, rtt };

      results.push(overall);

      console.log(`ACK received. RTT = ${rtt} ms`);

      // Close connection after all ACKs received
      if (receivedCount >= OUT_REQUEST_COUNT) {
        console.log("Ending client");
        client.end();
      }
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
