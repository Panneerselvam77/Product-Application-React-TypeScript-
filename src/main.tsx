import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import store from "./redux/store.ts";
import { BrowserRouter } from "react-router-dom";
import Layout from "./Layout/Layout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <Layout>
          <App />
        </Layout>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
);
