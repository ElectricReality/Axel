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
ipv4="$(curl ifconfig.co)" > /dev/null 2>&1
echo "Starting Swarm"
docker swarm init --advertise-addr ${ipv4} > /dev/null 2>&1
echo "Starting Network"
docker network create --driver overlay axel-net > /dev/null 2>&1
echo "Starting Axel Service"
docker service create \
  --name axel-system \
  --network axel-net \
  --publish 8080:8080 \
  --mount type=bind,source=/var/run/docker.sock,destination=/var/run/docker.sock \
  nginx:alpine > /dev/null 2>&1
echo " "
echo "You can now start using Axel at http://${ipv4}:8080"
