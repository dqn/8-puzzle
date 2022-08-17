import type { AppProps } from "next/app";
import Head from "next/head";
import "../css/index.css";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>8 Puzzle</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
