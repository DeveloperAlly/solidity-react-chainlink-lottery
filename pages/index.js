import React, { useState, useEffect } from "react";
import "semantic-ui-css/semantic.min.css";
import { Form, Input, Button, Message, Icon } from "semantic-ui-react";
import web3 from "./web3";
import chainlinkLottery from "./contracts/chainlinkLottery";
import Layout from "./components/Layout";
import { useRouter } from "next/router";

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
  address: null,
  network: null,
};

const REQUIRED_NETWORK_CHAIN_ID = "0x4"; //Rinkeby network

const INITIAL_TRANSACTION_STATE = {
  loading: "",
  error: "",
  success: "",
};

function App(props) {
  const router = useRouter();
  const [walletConnected, setWalletConnected] = useState(
    INITIAL_WALLET_CONNECTION
  );
  const [data, setData] = useState({
    manager: null, //check if is manager for admin functions
    players: [],
    balance: "",
  });
  const [entryValue, setEntryValue] = useState("");
  const [walletMessage, setWalletMessage] = useState("");
  const [transactionState, setTransactionState] = useState(
    INITIAL_TRANSACTION_STATE
  );
  const { loading, error, success } = transactionState;

  //Check user has a wallet connected to play
  useEffect(() => {
    if (window.ethereum) {
      if (ethereum.isConnected()) {
        setWalletConnected({
          connectedStatus: true,
          address: ethereum.selectedAddress,
          network: ethereum.chainId,
        });
        if (ethereum.chainId !== REQUIRED_NETWORK_CHAIN_ID)
          changeChainRequest();
      }
      //metamask functions
      ethereum.on("accountsChanged", (accounts) => {
        // console.log("accounts", walletConnected, accounts);
        setWalletConnected({
          ...walletConnected,
          address: accounts[0],
        });
        setTransactionState(INITIAL_TRANSACTION_STATE);
      });
      ethereum.on("chainChanged", (chainId) => {
        // console.log("chain", chainId);
        if (chainId !== REQUIRED_NETWORK_CHAIN_ID) {
          setWalletMessage(
            <h3 onClick={changeChainRequest} style={{ marginTop: 0 }}>
              Incorrect Wallet Network! Change to Rinkeby Network 0x4 to enter
            </h3>
          );
          changeChainRequest();
          setWalletConnected({
            ...walletConnected,
            network: ethereum.chainId,
          });
          setTransactionState(INITIAL_TRANSACTION_STATE);
        } else {
          setWalletMessage(null);
        }
      });
      ethereum.on("disconnect", (err) => {
        // console.log("wallet disconnected", err);
        setWalletConnected(INITIAL_WALLET_CONNECTION);
      });
    } else {
      //user needs to connect a wallet to play (still want to display the lottery stats though!)
      setWalletConnected({
        connectedStatus: false,
        status:
          "To enter - please install an ethereum wallet like Metamask 🦊. You can also click the 'Install Metamask' Button in the header menu",
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
  useEffect(() => {
    console.log(data, walletConnected);
  }, [data, walletConnected]);

  const fetchData = async () => {
    // console.log("fetching contract data", chainlinkLottery);
    () => setTransactionState({ ...transactionState, loading: true }); //closure hell
    await Promise.all([
      chainlinkLottery.methods.manager().call(),
      chainlinkLottery.methods.getPlayers().call(),
      await web3.eth.getBalance(chainlinkLottery.options.address),
    ])
      .then((data) => {
        // console.log("manager, players, balance", data);
        setData({
          manager: data[0],
          players: data[1],
          balance: data[2],
        });
        () =>
          setTransactionState({ ...transactionState, loading: "", error: "" });
      })
      .catch((error) => {
        // console.log("error", error, data);
        setTransactionState({
          ...INITIAL_TRANSACTION_STATE,
          error: error.message,
        });
      });
  };

  //only tested on metamask
  const changeChainRequest = async () => {
    await ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: REQUIRED_NETWORK_CHAIN_ID }],
      })
      .then(() => {
        setWalletMessage(null);
      })
      .catch((err) => {
        setWalletMessage(
          <h3 onClick={changeChainRequest} style={{ marginTop: 0 }}>
            Incorrect Wallet Network! Change to Rinkeby Network 0x4 to enter
          </h3>
        );
      });
  };

  const onLotteryEnter = async (event) => {
    setTransactionState(INITIAL_TRANSACTION_STATE);
    event.preventDefault();
    if (entryValue <= 0.01) {
      () =>
        setTransactionState({
          ...INITIAL_TRANSACTION_STATE,
          error: "Minimum entry is > 0.01 ether",
        });
      return;
    }
    await window.ethereum.enable();
    let chainId = await web3.eth.getChainId(); //depracated in MM
    if (chainId != REQUIRED_NETWORK_CHAIN_ID) {
      changeChainRequest();
    }

    await web3.eth
      .getAccounts()
      .then(async (accounts) => {
        setTransactionState({
          ...INITIAL_TRANSACTION_STATE,
          loading: "Transaction is processing....",
        });
        await chainlinkLottery.methods
          .enter()
          .send({
            from: accounts[0],
            value: web3.utils.toWei(entryValue, "ether"),
          })
          .then((res) => {
            // console.log("res", res);
            const etherscanLink = `https://rinkeby.etherscan.io/tx/${res.transactionHash}`;
            setTransactionState({
              ...INITIAL_TRANSACTION_STATE,
              success: (
                <a href={etherscanLink} target="_blank">
                  View the transaction on Etherscan
                </a>
              ),
            });
            // router.replace(`/`); //this will refresh the lottery stats on the page
            setEntryValue("");
            fetchData();
          })
          .catch((err) => {
            // console.log("error:", err);
            setTransactionState({
              ...INITIAL_TRANSACTION_STATE,
              error: err.message,
            });
          });
      })
      .catch((err) => {
        setTransactionState({
          ...INITIAL_TRANSACTION_STATE,
          error: `Error: ${err.message || "Could not fetch accounts"}`,
        });
      });
  };

  const pickWinner = async () => {
    await web3.eth
      .getAccounts()
      .then(async (accounts) => {
        setTransactionState({
          ...INITIAL_TRANSACTION_STATE,
          loading: "Transaction is processing....",
        });
        await chainlinkLottery.methods
          .pickWinner()
          .send({
            from: accounts[0],
          })
          .then((res) => {
            // console.log(res);
            const etherscanLink = `https://rinkeby.etherscan.io/tx/${res.transactionHash}`;
            setTransactionState({
              ...INITIAL_TRANSACTION_STATE,
              success: (
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
              ),
            });
            fetchData();
          })
          .catch((err) =>
            setTransactionState({
              ...INITIAL_TRANSACTION_STATE,
              error: err.message || "Uknown Error occurred",
            })
          );
      })
      .catch((err) =>
        setTransactionState({
          ...INITIAL_TRANSACTION_STATE,
          error: `Error: ${err.message || "Could not fetch accounts"}`,
        })
      );
  };

  const renderAdminFunctions = () => {
    return (
      <>
        <hr />
        <h4>Time to pick a winner?</h4>
        <button
          onClick={pickWinner}
          disabled={ethereum.chainId !== REQUIRED_NETWORK_CHAIN_ID}
        >
          Pick Winner!
        </button>
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
          <button disabled={ethereum.chainId !== REQUIRED_NETWORK_CHAIN_ID}>
            Enter
          </button>
        </form>
      </>
    );
  };

  const isLotteryManager = () => {
    if (walletConnected.address && data.manager) {
      // console.log(walletConnected.address, data.manager);
      return (
        walletConnected.address.toLowerCase() === data.manager.toLowerCase()
      ); //eth addresses are not case sensitive
    }
    return false;
  };

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
        <Message
          icon
          negative={Boolean(error)}
          success={Boolean(success) && !Boolean(loading)}
          info={Boolean(loading)}
        >
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
            {Boolean(success) && !Boolean(loading) && (
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
      {data.manager && walletConnected.connectedStatus && renderEntryForm()}
      {isLotteryManager() && renderAdminFunctions()}
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
      {Boolean(walletMessage) && (
        <>
          <hr />
          <Message icon info style={{}}>
            <Icon name="exclamation" />
            {walletMessage}
          </Message>
        </>
      )}
      <p style={{ position: "relative", bottom: "-50px" }}>
        NB: This isn't really a fair lottery - you could enter many many times
        with the lowest amount and take the jackpot. BUT - the Chainlink random
        number generator is verifiably random! 😀
      </p>
    </Layout>
  );
}

App.getInitialProps = async () => {
  const [manager, players, balance] = await Promise.all([
    chainlinkLottery.methods.manager().call(),
    chainlinkLottery.methods.getPlayers().call(),
    await web3.eth.getBalance(chainlinkLottery.options.address),
  ]);
  //We should deal with errors - like no gas for contract here really.
  if (!manager) {
    router.push("/error");
  }
  return { manager, players, balance };
};

export default App;
