import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import authConfig from "./config/auth0-config.json";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#2196f3" },
    secondary: { main: "#f44336" },
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Auth0Provider {...authConfig} redirectUri={window.location.origin}>
      <App />
    </Auth0Provider>
  </ThemeProvider>,
  document.getElementById("root")
);
