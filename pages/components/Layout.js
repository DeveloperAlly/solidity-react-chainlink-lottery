import React, { useState, useEffect } from "react";
import { Container } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import Header from "./Header";
import Footer from "./Footer";

//Hosts the top level layout of our app & also handles wallet connection.
const Layout = ({ walletConnected, ...props }) => {
  return (
    <Container>
      <Header walletConnected={walletConnected} />
      {props.children}
      {/* <Footer /> */}
    </Container>
  );
};

export default Layout;
