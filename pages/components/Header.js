import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import { useRouter } from "next/router";

//Hosts the top level layout of our app
const Header = ({ walletConnected }) => {
  return (
    <Menu style={{ marginTop: "1em" }}>
      <Menu.Item onClick={() => router.push("/")}>ChainlinkLottery</Menu.Item>
      {!walletConnected.connectedStatus ? (
        <Menu.Menu position="right">
          <Menu.Item
            onClick={() => router.push("https://metamask.io/download.html")} //should add a callback to website
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
