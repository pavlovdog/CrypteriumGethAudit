#!/bin/bash

git clone https://github.com/pavlovdog/CrypteriumGethAudit.git

mkdir .ethereum

cd CrypteriumGethAudit/

./shell_helpers/install_docker.sh
./shell_helpers/install_dockercompose.sh

if [[ -z "${DEPLOY_ETHSTATS}" ]]; then
    sudo docker-compose -f docker-compose.stats.yml up -d
else
    sudo docker-compose -f docker-compose.yml up -d
fi