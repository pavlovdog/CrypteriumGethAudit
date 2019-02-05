const { envRequire } = require('./utils');

const config = {};

config.SERVER_LISTEN_PORT = parseInt(envRequire('SERVER_LISTEN_PORT'), 10);
config.SERVER_LISTEN_ADDR = envRequire('SERVER_LISTEN_ADDR');

config.REMOTE_URL = envRequire('REMOTE_URL');

config.RPC_ADDR = envRequire('RPC_ADDR');
config.RPC_PORT = parseInt(envRequire('RPC_PORT'), 10);

config.MAX_VALID_HEIGHT_DIFF = parseInt(envRequire('MAX_VALID_HEIGHT_DIFF'), 10);

config.UNHEALTHY_API_PROVIDER_STATUS = parseInt(envRequire('UNHEALTHY_API_PROVIDER_STATUS'), 10);
config.HEALTHY_STATUS_CODE = parseInt(envRequire('HEALTHY_STATUS_CODE'), 10);
config.UNHEALTHY_STATUS_CODE = parseInt(envRequire('UNHEALTHY_STATUS_CODE'), 10);

config.REMOTE_WEB3_URL = envRequire('REMOTE_WEB3_URL');

module.exports = config;
