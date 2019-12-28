echo "================================================"
echo "||      ___      ___   ___  _______  __       ||"
echo "||     /   \     \  \ /  / |   ____||  |      ||"
echo "||    /  ^  \     \  V  /  |  |__   |  |      ||"
echo "||   /  /_\  \     >   <   |   __|  |  |      ||"
echo "||  /  _____  \   /  .  \  |  |____ |  '----. ||"
echo "|| /__/     \__\ /__/ \__\ |_______||_______| ||"
echo "||                                            ||"
echo "||         Starting Axel Installation         ||"
echo "||                                            ||"
echo "================================================"
echo ""
ipv4="$(curl ifconfig.co)"
echo "Starting Swarm"
docker swarm init --advertise-addr ${ipv4}
echo "Starting Network"
docker network create --driver overlay axel-net
echo "Starting Axel Database"
docker service create \
  --name axel-system-database \
  --network axel-net \
  --restart always \
  --mount type=volume,source=axel-system-database-data,target=/data/db \
  --mount type=volume,source=axel-system-database-config,target=/data/configdb \
  mongo:latest
echo "Starting Axel Service"
docker service create \
  --name axel-system \
  --network axel-net \
  --restart always \
  --publish 8080:8080 \
  --mount type=bind,source=/var/run/docker.sock,destination=/var/run/docker.sock \
  nginx:alpine
echo " "
echo "You can now start using Axel at http://${ipv4}:8080"
