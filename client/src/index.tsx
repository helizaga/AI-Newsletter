import { createRoot } from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import authConfig from "./config/auth0-config.json";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: { main: "#2196f3" },
    secondary: { main: "#f44336" },
  },
});

const startApp = () => {
  const container = document.getElementById("root");
  if (container !== null) {
    console.log("Rendering React app...");
    const root = createRoot(container);
    root.render(
      <ThemeProvider theme={theme}>
        <Auth0Provider
          {...authConfig}
          authorizationParams={{ redirect_uri: window.location.origin }}
        >
          <App />
        </Auth0Provider>
      </ThemeProvider>
    );
    console.log("React app rendered.");
  } else {
    console.error("Root container not found.");
  }
};

// Call the startApp function to start the application
startApp();
