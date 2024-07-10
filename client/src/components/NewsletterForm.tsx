// NewsletterForm.js
import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { useNewsletterQuery } from "../hooks/useNewsletterQuery";
import { useAdmin } from "../contexts/AdminContext";

const NewsletterForm = () => {
  const admin = useAdmin();

  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");
  const { createNewsletterMutation, newsletters } = useNewsletterQuery();

  const isDuplicate = newsletters?.some(
    (newsletter) => newsletter.topic === topic && newsletter.reason === reason
  );

  const isInvalid = !topic.trim() || !reason.trim() || isDuplicate;

  return (
    <div style={{ margin: "20px" }}>
      <TextField
        label="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <TextField
        label="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={isInvalid} // Disable the button if it's a duplicate
        onClick={() => {
          if (admin?.sub) {
            createNewsletterMutation.mutate(
              {
                adminID: admin.sub,
                topic,
                reason,
              },
              {
                onSuccess: () => {
                  setTopic("");
                  setReason(""); // Clear the form upon successful mutation
                },
              }
            );
          }
        }}
      >
        Create Newsletter
      </Button>
      {isDuplicate && (
        <p>A newsletter with this topic and reason already exists.</p>
      )}
    </div>
  );
};

export default NewsletterForm;
