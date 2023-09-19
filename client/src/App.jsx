import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "react-query"; // Add this
import AuthenticatedApp from "./components/AuthenticatedApp";
import LoginButton from "./components/LoginButton";
import axios from "axios";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  console.log(user);

  useEffect(() => {
    if (isAuthenticated && user) {
      axios.post("http://localhost:3001/api/update-user", {
        id: user.sub,
        name: user.name,
        email: user.email,
      });
    }
  }, [isAuthenticated, user]);

  return (
    <QueryClientProvider client={queryClient}>
      {isLoading ? (
        "Loading..."
      ) : isAuthenticated ? (
        <AuthenticatedApp user={user} />
      ) : (
        <LoginButton />
      )}
    </QueryClientProvider>
  );
};

export default App;
