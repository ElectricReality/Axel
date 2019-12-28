echo "Starting Axel Installation..."
ipv4="$(curl ifconfig.co)"
docker swarm init --advertise-addr ${ipvr} > /dev/null 2>&1
