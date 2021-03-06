clear
echo "================================================"
echo "||      ___      ___   ___  _______  __       ||"
echo "||     /   \     \  \ /  / |   ____||  |      ||"
echo "||    /  ^  \     \  V  /  |  |__   |  |      ||"
echo "||   /  /_\  \     >   <   |   __|  |  |      ||"
echo "||  /  _____  \   /  .  \  |  |____ |  '----. ||"
echo "|| /__/     \__\ /__/ \__\ |_______||_______| ||"
echo "||                                            ||"
echo "||        Starting Axel Uninstallation        ||"
echo "||                                            ||"
echo "================================================"
echo " "
echo "Removing Services"
docker service rm $(docker service ls -q)
echo "Removing Swarm"
docker swarm leave --force 
echo "Starting System Prune"
docker system prune --all --force
echo " "
echo "Uninstallation Complete! Thank you for using Axel."
