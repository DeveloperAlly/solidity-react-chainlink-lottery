import web3 from "../web3";
import ChainlinkLottery from "../../build/contracts/ChainlinkLottery.json";

const address = process.env.NEXT_PUBLIC_DEPLOYED_CONTRACT_ADDRESS; //"0x3395Da946aA385994019467392eb8055F6A6ECf4" //""
console.log("address", address);
const instance = new web3.eth.Contract(ChainlinkLottery.abi, address);
export default instance;
