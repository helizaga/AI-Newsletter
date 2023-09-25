// Import necessary modules and components
import React from "react";
import LogoutButton from "./LogoutButton";
import NewsletterList from "./NewsletterList";
import EmailList from "./EmailList.jsx";
import NewsletterForm from "./NewsletterForm";
import { useNewsletterQuery } from "../hooks/useNewsletterQuery";

// The AuthenticatedApp component handles the authenticated part of the application
const AuthenticatedApp = ({ admin }) => {
  // Local states to manage the topic and reason for newsletters
  const { emailList, refetchEmails, newsletters } = useNewsletterQuery(admin);

  // Render the application UI
  return (
    <>
      <LogoutButton />
      <NewsletterForm admin={admin} />
      {/* List of newsletters */}
      <NewsletterList newsletters={newsletters} admin={admin} />
      {/* List of emails with the ability to refetch */}
      <EmailList
        admin={admin}
        emailList={emailList}
        refetchEmails={refetchEmails}
      />
    </>
  );
};

// Export the component for external use
export default AuthenticatedApp;
