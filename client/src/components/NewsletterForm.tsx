// NewsletterForm.js
import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { useNewsletterQuery } from "../hooks/useNewsletterQuery";
import { useAdmin } from "../contexts/AdminContext";

const NewsletterForm = () => {
  const admin = useAdmin();

  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");
  const { createNewsletterMutation } = useNewsletterQuery();

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
        onClick={() => {
          if (admin?.sub) {
            createNewsletterMutation.mutate({
              adminID: admin.sub,
              topic,
              reason,
            });
          }
        }}
      >
        Create Newsletter
      </Button>
    </div>
  );
};

export default NewsletterForm;
