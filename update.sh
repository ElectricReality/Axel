git pull
docker build -t axel:latest .
docker service update --force axel-system
