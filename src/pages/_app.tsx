import type { AppProps } from "next/app";
import "../css/index.css";

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default App;
