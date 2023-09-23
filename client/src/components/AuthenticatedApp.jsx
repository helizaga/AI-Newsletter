// Import necessary modules and components
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import LogoutButton from "./LogoutButton";
import { fetchEmails, fetchNewsletters, createNewsletter } from "./apiService";
import NewsletterList from "./NewsletterList";
import EmailList from "./EmailList.jsx";
import NewsletterForm from "./NewsletterForm";

// The AuthenticatedApp component handles the authenticated part of the application
const AuthenticatedApp = ({ admin }) => {
  // Initialize React Query's client for cache manipulation
  const queryClient = useQueryClient();

  // Local states to manage the topic and reason for newsletters
  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");

  // Fetch the email list associated with the admin and enable refetching
  const { data: emailList, refetch: refetchEmails } = useQuery(
    ["emails", admin.sub],
    () => fetchEmails(admin.sub)
  );

  // Fetch the newsletters associated with the admin
  const { data: newsletters } = useQuery(["newsletters", admin.sub], () =>
    fetchNewsletters(admin.sub)
  );

  // Create a newsletter using a mutation and invalidate the cache to refetch newsletters
  const createNewsletterMutation = useMutation(createNewsletter, {
    onSuccess: () => queryClient.invalidateQueries(["newsletters", admin.sub]),
  });

  // Render the application UI
  return (
    <>
      <LogoutButton />
      <NewsletterForm
        admin={admin}
        topic={topic}
        setTopic={setTopic}
        reason={reason}
        setReason={setReason}
        createNewsletterMutation={createNewsletterMutation}
      />
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
