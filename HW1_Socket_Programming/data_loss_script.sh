# Add packet loss of 5%
sudo tc qdisc add dev lo root netem loss 5%

# Reset Packet Loss
sudo tc qdisc del dev lo root

# Add packet loss of 10%
sudo tc qdisc add dev lo root netem loss 10%

# Add packet loss of 20%
sudo tc qdisc add dev lo root netem loss 20%

# Add packet loss of 40%
sudo tc qdisc add dev lo root netem loss 40%
