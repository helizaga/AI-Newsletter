import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthenticatedApp from "./components/AuthenticatedApp";
import LoginButton from "./components/auth/LoginButton";
import axios from "axios";
import { AdminContext } from "./contexts/AdminContext";
import { AdminContextType } from "./types/common";
const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, user: admin, isLoading } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && admin) {
      axios.post("http://localhost:3001/api/admin/update", {
        id: admin.sub,
        name: admin.name,
        email: admin.email,
      });
    }
  }, [isAuthenticated, admin]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <header className="App-header">
          <h1>TLDRMailer</h1>
        </header>
        <main className="App-main">
          {isLoading ? (
            "Loading..."
          ) : isAuthenticated ? (
            <AdminContext.Provider value={admin as AdminContextType}>
              <AuthenticatedApp />
            </AdminContext.Provider>
          ) : (
            <LoginButton />
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default App;
