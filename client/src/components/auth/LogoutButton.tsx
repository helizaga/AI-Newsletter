import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";

/**
 * LogoutButton component that logs the user out when clicked.
 */
const LogoutButton = () => {
  const { logout } = useAuth0();
  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;
