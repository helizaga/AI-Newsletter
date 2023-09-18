import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import authConfig from "./config/auth0-config.json";

ReactDOM.render(
  <Auth0Provider {...authConfig} redirectUri={window.location.origin}>
    <App />
  </Auth0Provider>,
  document.getElementById("root")
);
