# custom Docker network
docker network create testnet

# Builds docker image
docker build -t nodeapp .

# start server
docker run -d --name server --network testnet nodeapp

# start client
docker run -it --name client --network testnet nodeapp node client.js



# iperf3 server
docker run -d --name iperf-server --network testnet networkstatic/iperf3 -s

# iperf3 client (to generate traffic)
docker run -it --network testnet networkstatic/iperf3 -c iperf-server -u -b 100M


# Apply tc:
# On the Docker bridge (testnet), you can run:
sudo tc qdisc add dev br-<id_of_testnet> root netem delay 100ms
