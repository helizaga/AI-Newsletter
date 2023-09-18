import React, { useEffect, useState } from "react";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

// Component for Authenticated Users
const AuthenticatedApp = ({ user }) => {
  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");

  const createNewsletter = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3001/api/create-newsletter",
        {
          email: user.email,
          topic,
          reason,
        }
      );
      console.log("Newsletter created:", res.data);
    } catch (err) {
      console.error("Failed to create newsletter:", err);
    }
  };

  return (
    <>
      <LogoutButton />
      <div>
        <input
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button onClick={createNewsletter}>Create Newsletter</button>
      </div>
    </>
  );
};

// Component for Loading State
const Loading = () => <div>Loading...</div>;

// Main App Component
const App = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  // Side-effect for updating user
  useEffect(() => {
    if (isAuthenticated) {
      axios.post("http://localhost:3001/api/update-user", {
        email: user.email,
        name: user.name,
      });
    }
  }, [isAuthenticated, user]);

  // UI Logic
  return isLoading ? (
    <Loading />
  ) : isAuthenticated ? (
    <AuthenticatedApp user={user} />
  ) : (
    <LoginButton />
  );
};

export default App;
