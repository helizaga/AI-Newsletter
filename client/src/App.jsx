import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AuthenticatedApp from "./components/AuthenticatedApp";
import LoginButton from "./components/LoginButton";
import axios from "axios";

const App = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      axios.post("http://localhost:3001/api/update-user", {
        email: user.email,
        name: user.name,
      });
    }
  }, [isAuthenticated, user]);

  return isLoading ? (
    "Loading..."
  ) : isAuthenticated ? (
    <AuthenticatedApp user={user} />
  ) : (
    <LoginButton />
  );
};

export default App;
