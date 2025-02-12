import "../styles/globals.sass";
import "../styles/prediction.css";
import "../styles/general_layouting.css";
import "../styles/data-selector.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { PersistGate } from "reduxjs-toolkit-persist/integration/react";
import { persistStore } from "reduxjs-toolkit-persist";
import { store } from "../src/store";
import "../styles/modelhistory.css";

const persistor = persistStore(store);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}
