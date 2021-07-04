var ChainlinkLottery = artifacts.require("./ChainlinkLottery.sol");

module.exports = function (deployer) {
  deployer.deploy(ChainlinkLottery);
};
