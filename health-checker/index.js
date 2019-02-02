const http = require('http');
const config = require('./config');
const {
  logger,
  getLatestBlockNumberByRPC,
  getLatestBlockNumberByRemoteAPI,
} = require('./utils');

logger.info(`Starting health-checker service on ${config.SERVER_LISTEN_PORT}`);

http.createServer(async (req, res) => {
  logger.info('Received the health-check request');

  // Execute the request to the RPC
  const localLatestBlockNumber = await getLatestBlockNumberByRPC(config);
  // - Check that the status is `true`
  // in this case the instance is definetly unhealthy
  if (localLatestBlockNumber.status === false) {
    logger.error(`Unhealthy node, error message: ${localLatestBlockNumber.message}`);

    res.writeHead(config.UNHEALTHY_STATUS_CODE);
    res.end();
    return;
  }

  // Execute the request to the Etherscan
  const globalLatestBlockNumber = await getLatestBlockNumberByRemoteAPI(config);
  // - Check that everything is okey
  if (localLatestBlockNumber.status === false) {
    logger.warn(`Unhealthy API provider (${config.REMOTE_URL}), error message: ${localLatestBlockNumber.message}`);

    // Unhealthy API provider doesn't tell us anything about the health of the node
    // So we can send the 200 code (means 'healthy' status)
    // But if you need, you may edit the config and set up e.g. 500 code
    // which means 'unhealthy' status
    res.writeHead(config.UNHEALTHY_API_PROVIDER_STATUS);
    res.end();
    return;
  }


  logger.info(`Local height: ${localLatestBlockNumber.data}, remote height: ${globalLatestBlockNumber.data}`);

  // Compare the block heights on the local node and remote API provider
  // - It's possible, that the local node's height is the biggest one
  if (localLatestBlockNumber.data > globalLatestBlockNumber.data) {
    logger.info('Local height is bigger than the remote');
    res.writeHead(config.HEALTHY_STATUS_CODE);
    res.end();
    return;
  }

  // - Calculate the difference between the block heights
  const diff = globalLatestBlockNumber.data - localLatestBlockNumber.data;

  if (diff <= config.MAX_VALID_HEIGHT_DIFF) {
    logger.info(`Heights difference is normal (${diff} blocks less)`);
    res.writeHead(config.HEALTHY_STATUS_CODE);
  } else {
    logger.error(`Heights difference is too big (${diff} blocks less)`);
    res.writeHead(config.UNHEALTHY_STATUS_CODE);
  }

  res.end();
  return;
}).listen(config.SERVER_LISTEN_PORT);
