// Import necessary modules and components
import React from "react";
import LogoutButton from "./LogoutButton";
import NewsletterList from "./NewsletterList";
import EmailList from "./EmailList.jsx";
import NewsletterForm from "./NewsletterForm";

// The AuthenticatedApp component handles the authenticated part of the application
const AuthenticatedApp = () => {
  // Local states to manage the topic and reason for newsletters

  // Render the application UI
  return (
    <>
      <LogoutButton />
      <NewsletterForm />
      <NewsletterList />
      <EmailList />
    </>
  );
};

// Export the component for external use
export default AuthenticatedApp;
