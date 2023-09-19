// AuthenticatedApp.js
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import LogoutButton from "./LogoutButton";
import { fetchEmails, fetchNewsletters, createNewsletter } from "./apiService";
import NewsletterList from "./NewsletterList";
import EmailList from "./EmailList.jsx";
import NewsletterForm from "./NewsletterForm";

const AuthenticatedApp = ({ user }) => {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");

  const { data: emailList, refetch: refetchEmails } = useQuery(
    ["emails", user.sub],
    () => fetchEmails(user.sub)
  );
  const { data: newsletters } = useQuery(["newsletters", user.sub], () =>
    fetchNewsletters(user.sub)
  );

  const createNewsletterMutation = useMutation(createNewsletter, {
    onSuccess: () => queryClient.invalidateQueries(["newsletters", user.sub]),
  });

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
      <NewsletterList newsletters={newsletters} user={user} />
      <EmailList
        user={user}
        emailList={emailList}
        refetchEmails={refetchEmails}
      />
    </>
  );
};

export default AuthenticatedApp;
