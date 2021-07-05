import React, { useState, useEffect } from "react";
import "semantic-ui-css/semantic.min.css";
import web3 from "./web3";
import chainlinkLottery from "./contracts/chainlinkLottery";
import Layout from "./components/Layout";

function App() {
  // web3.eth.getAccounts().then((res)=>console.log(res))
  const [data, setData] = useState({
    manager: "",
    players: [],
    balance: "",
  });
  const [entryValue, setEntryValue] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // SANITY CHECK
  useEffect(() => {
    console.log(data);
  }, [data]);

  //only run on first render
  const fetchData = async () => {
    console.log("fetching data", chainlinkLottery);
    const [manager, players, balance] = await Promise.all([
      chainlinkLottery.methods.manager().call(),
      chainlinkLottery.methods.getPlayers().call(),
      await web3.eth.getBalance(chainlinkLottery.options.address),
    ]);
    console.log(manager, players, balance);
    setData({
      manager,
      players,
      balance,
    });
  };

  const onLotteryEnter = async (event) => {
    event.preventDefault();
    if (entryValue <= 0.01) {
      setMessage("Minimum entry is > 0.01 ether");
      return;
    }
    await web3.eth
      .getAccounts()
      .then(async (accounts) => {
        setMessage("Waiting on transaction success...");
        await chainlinkLottery.methods
          .enter()
          .send({
            from: accounts[0],
            value: web3.utils.toWei(entryValue, "ether"),
          })
          .then((res) => {
            console.log("res", res);
            const etherscanLink = `https://rinkeby.etherscan.io/tx/${res.transactionHash}`;
            setMessage(
              <>
                <p>You have been entered! </p>
                <p>
                  See your transaction on etherscan:
                  <a href={etherscanLink} target="_blank">
                    {etherscanLink}
                  </a>
                </p>
              </>
            );
            setEntryValue("");
            fetchData();
          })
          .catch((err) => {
            console.log("error:", err);
            setMessage(`Error: ${err.message || "unknown error occurred"}`);
          });
      })
      .catch((err) => {
        setMessage(`Error: ${err.message || "Could not fetch accounts"}`);
      });
  };

  const pickWinner = async () => {
    await web3.eth
      .getAccounts()
      .then(async (accounts) => {
        setMessage("Waiting on transaction success...");
        await chainlinkLottery.methods
          .pickWinner()
          .send({
            from: accounts[0],
          })
          .then((res) => {
            console.log(res);
            const etherscanLink = `https://rinkeby.etherscan.io/tx/${res.transactionHash}`;
            setMessage(
              <>
                <p>A winner has been picked! </p>
                <p>Winner: {res.to} </p>
                <p>
                  See transaction:
                  <a href={etherscanLink} target="_blank">
                    {etherscanLink}
                  </a>
                </p>
              </>
            );
            fetchData();
          })
          .catch((err) =>
            setMessage(`Error: ${err.message || "unknown error occurred"}`)
          );
      })
      .catch((err) => {
        setMessage(`Error: ${err.message || "Could not fetch accounts"}`);
      });
  };

  return (
    <Layout>
      <h2>Chainlink Lottery Contract</h2>
      <p>This contract is managed by {data.manager}. </p>
      <p>There are currently {data.players.length} people entered.</p>
      <p>Lottery pool is currently {web3.utils.fromWei(data.balance)} eth.</p>
      <hr />
      <form onSubmit={(e) => onLotteryEnter(e)}>
        <h4>Want to try your luck?</h4>
        <div>
          <label>Amount of ether to enter</label>
          <input
            value={entryValue}
            onChange={(event) => setEntryValue(event.target.value)}
          />
        </div>
        <button>Enter</button>
      </form>
      <hr />
      <h4>Time to pick a winner?</h4>
      <button onClick={pickWinner}>Pick Winner!</button>
      <hr />
      <div>{message}</div>
    </Layout>
  );
}

export default App;

/*
import Web3 from "web3";
 
window.ethereum.request({ method: "eth_requestAccounts" });
 
const web3 = new Web3(window.ethereum);
 
export default web3;
*/

/*
// Class version
import logo from "./logo.svg";
import "./App.css";
import React from "react";
 
class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}
export default App;
*/
