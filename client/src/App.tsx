import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "react-query"; // Add this
import AuthenticatedApp from "./components/AuthenticatedApp";
import LoginButton from "./components/auth/LoginButton";
import axios from "axios";
import { AdminContext } from "./contexts/AdminContext";
import { AdminContextType } from "./types/common";
const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user: admin, isLoading } = useAuth0();

  console.log(admin);

  useEffect(() => {
    if (isAuthenticated && admin) {
      axios.post("http://localhost:3001/api/update-admin", {
        id: admin.sub,
        name: admin.name,
        email: admin.email,
      });
    }
  }, [isAuthenticated, admin]);

  return (
    <QueryClientProvider client={queryClient}>
      {isLoading ? (
        "Loading..."
      ) : isAuthenticated ? (
        <AdminContext.Provider value={admin as AdminContextType}>
          <AuthenticatedApp />
        </AdminContext.Provider>
      ) : (
        <LoginButton />
      )}
    </QueryClientProvider>
  );
};

export default App;
