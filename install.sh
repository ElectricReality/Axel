clear
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
ipv4="$(dig +short myip.opendns.com @resolver1.opendns.com)" > /dev/null 2>&1
session="$(date +%s | sha256sum | base64 | head -c 32 )"
echo "Starting Swarm"
docker swarm init --advertise-addr ${ipv4} > /dev/null 2>&1
echo "Starting Network"
docker network create --driver overlay axel-net
echo "Starting Axel Database"
docker service create \
  --name axel-system-database \
  --network axel-net \
  --mount type=volume,source=axel-system-database-data,target=/data/db \
  --mount type=volume,source=axel-system-database-config,target=/data/configdb \
  mongo:latest > /dev/null 2>&1
echo "Building Axel Image"
docker build -t axel:latest .
echo "Starting Axel Service"
docker service create \
  --name axel-system \
  --network axel-net \
  --publish 8080:8080 \
  --env session=${session} \
  --mount type=bind,source=/var/run/docker.sock,destination=/var/run/docker.sock \
  axel
echo " "
echo "You can now start using Axel at http://${ipv4}:8080/login. Please set new username and password immediately at the admin dashboard!"
