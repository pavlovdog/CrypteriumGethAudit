const config = {};

// The load balancer will send request to the port
config.SERVER_LISTEN_PORT = 5050;

config.REMOTE_URL = 'https://api.blockcypher.com/v1/eth/main';

config.RPC_ADDR = '127.0.0.1';
config.RPC_PORT = 8545;

config.MAX_VALID_HEIGHT_DIFF = 50;

config.UNHEALTHY_API_PROVIDER_STATUS = 200;
config.HEALTHY_STATUS_CODE = 200;
config.UNHEALTHY_STATUS_CODE = 500;

module.exports = config;
