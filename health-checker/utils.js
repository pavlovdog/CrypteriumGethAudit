const winston = require('winston');
const request = require('request');
const Web3 = require('web3');


/**
 * envRequire - returns the variable from the environment.
 * If the error not found - throw an error.
 *
 * @param  {type} varName Name of the varibale
 * @return {type}         Variable value
 */
function envRequire(varName) {
  if (process.env[varName] === undefined) {
    throw new Error(`Environment variable ${varName} is required.`);
  }

  return process.env[varName];
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ]
});

/**
 * Getting the blockchain height from the node RPC.
 *
 * @see https://www.blockcypher.com/dev/ethereum/#rate-limits-and-tokens
 * @param   {object}    config Serice condifguration, check ./config.js
 * @param   {string}    config.RPC_ADDR IP address of the RPC listener
 * @param   {string}    config.RPC_PORT Network port of the RPC listener
 * @return  {Promise}   Promise object represents the latest block number or some error
 */
async function getLatestBlockNumberByRPC(config) {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(`http://${config.RPC_ADDR}:${config.RPC_PORT}`),
  );

  return new Promise((resolve) => {
    web3.eth.getBlockNumber((error, result) => {
      if (error) return resolve({ status: false, message: error });

      return resolve({ status: true, data: result });
    })
  });
}

/**
 * In this code we will use the BlockCypher API
 * For public methods it doesn't require any keys and so on
 * The rate limit is also pretty high
 * > Classic requests, up to 3 requests/sec and 200 requests/hr
 *
 * @see https://www.blockcypher.com/dev/ethereum/#rate-limits-and-tokens
 * @param   {object}    config Serice condifguration, check ./config.js
 * @param   {string}    config.REMOTE_URL URL to make request to
 * @return  {Promise}   Promise object represents the latest block number or some error
 */
async function getLatestBlockNumberByRemoteAPI(config) {
  return new Promise((resolve) => {
    request({
      method: 'GET',
      uri: config.REMOTE_URL,
      json: true,
    }, (error, response, body) => {
      if (error) return resolve({ status: false, message: error });

      return resolve({ status: true, data: body.height });
    })
  });
}


/**
 * getLatestBlockNumberByRemoteWeb3 - Receive the latest block number,
 * using some remote RPC provider. In this example we're gonna use the Infura
 * API.
 *
 * @param   {object}    config Serice condifguration, check ./config.js
 * @param   {string}    config.REMOTE_URL URL to make request to
 * @return  {Promise}   Promise object represents the latest block number or some error
 */
async function getLatestBlockNumberByRemoteWeb3(config) {
  return new Promise(async (resolve) => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(config.REMOTE_WEB3_URL),
    );

    try {
      const blockNumber = await web3.eth.getBlockNumber();
      return resolve({ status: true, data: blockNumber });
    } catch (err) {
      return resolve({ status: false, message: err.message });
    }
  });
}


module.exports = {
  logger,
  getLatestBlockNumberByRPC,
  getLatestBlockNumberByRemoteAPI,
  getLatestBlockNumberByRemoteWeb3,
  envRequire,
};
