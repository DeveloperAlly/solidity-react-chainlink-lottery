import React, { useState, useEffect } from "react";
import "semantic-ui-css/semantic.min.css";
import { Form, Input, Button, Message, Icon } from "semantic-ui-react";
import web3 from "./web3";
import chainlinkLottery from "./contracts/chainlinkLottery";
import Layout from "./components/Layout";

/**
 * 1. Check if wallet is installed, connected & on rinkeby network
 * 2. Connect to Lottery contract
 *
 * All functions
 * - View Lottery Details (including prizes)
 *
 * Players Functions
 * - Enter Lottery
 *
 * Admin Only functions
 * -Pick Winner (would be better if this was on a timer or picked a winner for x number of entries)
 * -Withdraw Link Funds from Contract
 *
 */
const INITIAL_WALLET_CONNECTION = {
  connectedStatus: false,
  status:
    "Connect to a wallet like Metamask 🦊 using the button on the top right.",
  address: null,
};

const INITIAL_TRANSACTION_STATE = {
  loading: "",
  error: "",
  success: "",
};

function App(props) {
  const [walletConnected, setWalletConnected] = useState(
    INITIAL_WALLET_CONNECTION
  );
  const [data, setData] = useState({
    manager: null, //check if is manager for admin functions
    players: [],
    balance: "",
  });
  const [entryValue, setEntryValue] = useState("");
  const [message, setMessage] = useState("");
  const [transactionState, setTransactionState] = useState(
    INITIAL_TRANSACTION_STATE
  );
  const { loading, error, success } = transactionState;

  useEffect(() => {
    // console.log("eth", window.ethereum);
    // console.log("web3", web3);
    if (window.ethereum) {
      setWalletConnected({
        ...walletConnected,
        connectedStatus: true,
      });
    } else {
      //user needs to connect a wallet to play (still want to display the lottery stats though!)
      setWalletConnected({
        connectedStatus: false,
        status:
          "To enter - please install an ethereum wallet like Metamask 🦊 into your browser or click the 'Install Metamask' Button in the header menu",
        address: null,
      });
    }
    setData({
      manager: props.manager || null,
      players: props.players || [],
      balance: props.balance || null,
    });
  }, []);

  // SANITY CHECK
  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

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

  const renderAdminFunctions = () => {
    return (
      <>
        <hr />
        <h4>Time to pick a winner?</h4>
        <button onClick={pickWinner}>Pick Winner!</button>
      </>
    );
  };

  const renderEntryForm = () => {
    return (
      <>
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
      </>
    );
  };

  const isLotteryManager = () => {};

  const renderLotteryDetails = () => {
    return (
      <>
        <p>This contract is managed by {data.manager}. </p>
        <p>There are currently {data.players.length} people entered.</p>
        <p>Lottery pool is currently {web3.utils.fromWei(data.balance)} eth.</p>
      </>
    );
  };

  const renderMessage = () => {
    return (
      <>
        <hr />
        <Message icon negative={Boolean(error)} success={Boolean(success)}>
          <Icon
            name={
              loading
                ? "circle notched"
                : error
                ? "times circle"
                : "check circle"
            }
            loading={Boolean(loading)}
          />
          <Message.Content>
            {Boolean(success) && (
              <Message.Header>Transaction Success!</Message.Header>
            )}
            {loading ? loading : error ? error : success}
          </Message.Content>
        </Message>
      </>
    );
  };

  return (
    <Layout walletConnected={walletConnected}>
      <h2>Chainlink Lottery Contract</h2>
      <h4>The decentralised, verifiably fair lottery!</h4>
      {data.manager && renderLotteryDetails()}
      {/* {data.manager && walletConnected.connectedStatus && renderEntryForm()} */}
      {/* {!isLotteryManager && renderAdminFunctions()} */}
      {Boolean(loading || error || success) && renderMessage()}
      {!walletConnected.connectedStatus && (
        <>
          <hr />
          <h4>Want to try your luck?</h4>
          <Message icon info style={{ justifyContent: "space-between" }}>
            {walletConnected.status}
            <Icon name="hand point up outline" />
          </Message>
        </>
      )}
    </Layout>
  );
}

App.getInitialProps = async () => {
  const [manager, players, balance] = await Promise.all([
    chainlinkLottery.methods.manager().call(),
    chainlinkLottery.methods.getPlayers().call(),
    await web3.eth.getBalance(chainlinkLottery.options.address),
  ]);
  //We should deal with errors - like no gas for contract really.
  return { manager, players, balance };
};

export default App;

// Client side function if not using next - this will throw a CORS error on firefox and IE due to the HttpProvider of web3 (see ./web3)
// const fetchData = async () => {
//   // console.log("fetching contract data", chainlinkLottery);
//   setTransactionState({ ...transactionState, loading: true });
//   await Promise.all([
//     chainlinkLottery.methods.manager().call(),
//     chainlinkLottery.methods.getPlayers().call(),
//     await web3.eth.getBalance(chainlinkLottery.options.address),
//   ])
//     .then((data) => {
//       console.log("manager, players, balance", data);
//       // setData({
//       //   manager,
//       //   players,
//       //   balance,
//       // });
//       setTransactionState({
//         ...transactionState,
//         loading: false,
//       });
//     })
//     .catch((error) => {
//       console.log("error", error, data);
//       setTransactionState({
//         ...transactionState,
//         loading: false,
//         error: error.message,
//       });
//     });
// };
