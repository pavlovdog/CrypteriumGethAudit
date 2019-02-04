```bash
echo 'LC_ALL=C' >> .bashrc;
exec bash
sudo apt install git build-essential
git clone https://github.com/pavlovdog/GethCluster
cd GethCluster/
chmod +x shell_helpers/*
sudo ./shell_helpers/install_docker.sh
sudo docker-compose up -d
```
