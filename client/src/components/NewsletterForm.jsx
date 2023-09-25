// NewsletterForm.js
import React from "react";
import { TextField, Button } from "@mui/material";
import { useNewsletterQuery } from "../hooks/useNewsletterQuery";
import { useNewsletterState } from "../hooks/useNewsletterState";

const NewsletterForm = ({ admin }) => {
  // Initialize React Query's client for cache manipulation
  const { topic, setTopic, reason, setReason } = useNewsletterState();
  const { createNewsletterMutation } = useNewsletterQuery(admin);

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
        onClick={() =>
          createNewsletterMutation.mutate({ adminID: admin.sub, topic, reason })
        }
      >
        Create Newsletter
      </Button>
    </div>
  );
};

export default NewsletterForm;
