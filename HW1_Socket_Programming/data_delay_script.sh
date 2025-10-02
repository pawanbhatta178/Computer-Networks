# Introduce 100ms delay
sudo tc qdisc add dev lo root netem delay 100ms 

# Resets delay
sudo tc qdisc del dev lo root

# Introduce 400ms delay
sudo tc qdisc add dev lo root netem delay 400ms 
