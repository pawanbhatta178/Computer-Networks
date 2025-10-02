# custom Docker network
docker network create testnet

# Builds docker image
docker build -t nodeapp .

# start server
docker run --rm -d --name server --network testnet nodeapp

# Create Client and Bash into it
docker run -it --name client --network testnet nodeapp bash

# In the container console run to start making request to server container using `server` alias without congestion
node client.js data_congestion_0.json server


# iperf3 server to receive traffic
docker run -d --name iperf-server --network testnet networkstatic/iperf3 -s

# iperf3 client to generate traffic for 300 seconds
docker run --rm -it --network testnet networkstatic/iperf3 -c iperf-server -u -b 100M -t 300

# After congestion
node client.js data_congestion_100.json server

# If you have to enter client container to grab the data or rerun the process
sudo docker start -ai client

# Copy result from inside container to machine
sudo docker cp client:/app/data/data_congestion_0.json ./data_congestion_0.json
