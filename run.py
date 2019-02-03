import subprocess
from configparser import ConfigParser
import logging
import os
import sys


logging.basicConfig(level=logging.INFO)

if __name__ == '__main__':
    config = ConfigParser()
    config.read('config.ini')

    server_ip_list = config['SERVERS']['ips'].split(',')
    server_user = config['SERVERS']['user']
    ethstats_ind = int(config['ETHSTATS']['server_ip_num'])
    ethstats_secret = config['ETHSTATS']['secret']
    key_path = config['KEYS']['path_to_key']

    processes = []

    for ind, ip in enumerate(server_ip_list):
        logging.info(f'Starting installation on server {ip}')
        env = {}
        if ind == ethstats_ind:
            env = {'DEPLOY_ETHSTATS': True}

        proc = subprocess.Popen(
            f'ssh -o StrictHostKeyChecking=no -i {key_path} {server_user}@{ip} "bash -s" < ./shell_helpers/launch_project.sh',
            shell=True
        )
        processes.append(proc)

    for proc in processes:
        proc.wait()
