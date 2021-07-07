import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import { useRouter } from "next/router";

//Hosts the top level layout of our app
const Header = ({ walletConnected }) => {
  const router = useRouter();
  console.log("wallet", walletConnected); //not using this prop currently
  //- though you could implement a button to connect to a wallet here
  return (
    <Menu style={{ marginTop: "1em" }}>
      <Menu.Item onClick={() => router.push("/")}>ChainlinkLottery</Menu.Item>
      {!walletConnected.connectedStatus ? (
        <Menu.Menu position="right">
          <Menu.Item
            onClick={() => router.push("https://metamask.io/download.html")}
          >
            Install Metamask! 🦊
          </Menu.Item>
        </Menu.Menu>
      ) : (
        <Menu.Menu position="right">
          <Menu.Item color="blue">Wallet Connected! 😀</Menu.Item>
        </Menu.Menu>
      )}
    </Menu>
  );
};

export default Header;
