import "./styles/App.css";
import { useEffect } from "react";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.title = "Chainlink Lottery";
  });
  return (
    <Component {...pageProps}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </Component>
  );
}

export default MyApp;
