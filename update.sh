git pull
docker build -t axel:latest . > /dev/null
docker service update --force axel-system
