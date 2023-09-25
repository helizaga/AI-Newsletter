import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import authConfig from "./config/auth0-config.json";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createRoot } from "react-dom/client";

const theme = createTheme({
  palette: {
    primary: { main: "#2196f3" },
    secondary: { main: "#f44336" },
  },
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ThemeProvider theme={theme}>
    <Auth0Provider {...authConfig} redirectUri={window.location.origin}>
      <App />
    </Auth0Provider>
  </ThemeProvider>
);
