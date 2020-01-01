git pull
docker build -t axel:latest . > /dev/null 2>&1
docker service update --force axel-system
