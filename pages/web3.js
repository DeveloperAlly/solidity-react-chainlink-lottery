//try the ethers.js library
import Web3 from "web3";
// import { ethers } from "ethers"; //alternative for connections

let web3;
//Set the web3 connection here

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // We are in the browser and metamask is running.
  // window.ethereum.request({ method: "eth_requestAccounts" }); //don't do this yet
  web3 = new Web3(window.ethereum);
} else {
  // We are on the server *OR* the user is not running metamask
  //THIS WONT WORK ON FIREFOX OR SAFARI for client side rendering - it does work with NEXT getInitial props SSR
  const provider = new Web3.providers.HttpProvider(process.env.INFURA_ADDRESS);
  web3 = new Web3(provider);
  // let infuraProvider = new ethers.providers.InfuraProvider("rinkeby");
}

export default web3;

//connect the user to a wallet
/*
  Chain ids:
    0x1	1	Ethereum Main Network (Mainnet)
    0x3	3	Ropsten Test Network
    0x4	4	Rinkeby Test Network
    0x5	5	Goerli Test Network
    0x2a	42	Kovan Test Network
  */
