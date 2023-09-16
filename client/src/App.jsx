import React, { useEffect } from "react";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const App = () => {
  const { isAuthenticated, user } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      // Call your API to update or create the user in your database
      axios.post("http://localhost:3001/api/update-user", {
        email: user.email,
        name: user.name,
      });
    }
  }, [isAuthenticated, user]);

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <LogoutButton />
        </div>
      ) : (
        <div>
          <LoginButton />
        </div>
      )}
    </div>
  );
};

export default App;
