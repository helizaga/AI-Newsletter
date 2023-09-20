// Import necessary modules and components
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import LogoutButton from "./LogoutButton";
import { fetchEmails, fetchNewsletters, createNewsletter } from "./apiService";
import NewsletterList from "./NewsletterList";
import EmailList from "./EmailList.jsx";
import NewsletterForm from "./NewsletterForm";

// The AuthenticatedApp component handles the authenticated part of the application
const AuthenticatedApp = ({ user }) => {
  // Initialize React Query's client for cache manipulation
  const queryClient = useQueryClient();

  // Local states to manage the topic and reason for newsletters
  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");

  // Fetch the email list associated with the user and enable refetching
  const { data: emailList, refetch: refetchEmails } = useQuery(
    ["emails", user.sub],
    () => fetchEmails(user.sub)
  );

  // Fetch the newsletters associated with the user
  const { data: newsletters } = useQuery(["newsletters", user.sub], () =>
    fetchNewsletters(user.sub)
  );

  // Create a newsletter using a mutation and invalidate the cache to refetch newsletters
  const createNewsletterMutation = useMutation(createNewsletter, {
    onSuccess: () => queryClient.invalidateQueries(["newsletters", user.sub]),
  });

  // Render the application UI
  return (
    <>
      <LogoutButton />
      <NewsletterForm
        user={user}
        topic={topic}
        setTopic={setTopic}
        reason={reason}
        setReason={setReason}
        createNewsletterMutation={createNewsletterMutation}
      />
      {/* List of newsletters */}
      <NewsletterList newsletters={newsletters} user={user} />
      {/* List of emails with the ability to refetch */}
      <EmailList
        user={user}
        emailList={emailList}
        refetchEmails={refetchEmails}
      />
    </>
  );
};

// Export the component for external use
export default AuthenticatedApp;
