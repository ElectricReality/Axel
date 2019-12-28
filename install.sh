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
dbpassword="$(date +%s | sha256sum | base64 | head -c 32 )"
userpassword="$(date +%s | sha256sum | base64 | head -c 32 )"
echo "Starting Swarm"
docker swarm init --advertise-addr ${ipv4} > /dev/null 2>&1
echo "Starting Network"
docker network create --driver overlay axel-net > /dev/null 2>&1
echo "Starting Axel Database"
docker service create \
  --name axel-system-database \
  --network axel-net \
  --mount type=volume,source=axel-system-database-data,target=/data/db \
  --mount type=volume,source=axel-system-database-config,target=/data/configdb \
  mongo:latest > /dev/null 2>&1
echo "Starting Axel Service"
docker service create \
  --name axel-system \
  --network axel-net \
  --publish 8080:8080 \
  --mount type=bind,source=/var/run/docker.sock,destination=/var/run/docker.sock \
  nginx:alpine > /dev/null 2>&1
echo " "
echo "You can now start using Axel at http://${ipv4}:8080. Your password is ${userpassword}. The username is Axel."
