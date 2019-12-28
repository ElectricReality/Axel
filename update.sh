git pull
docker build -t axel . > /dev/null 2>&1
docker service update --force axel-system
