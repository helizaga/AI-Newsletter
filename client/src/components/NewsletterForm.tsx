import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { useNewsletterQuery } from "../hooks/useNewsletterQuery";
import { useAdmin } from "../contexts/AdminContext";
import ProgressDialog from "./ProgressDialog";

const NewsletterForm = () => {
  const admin = useAdmin();
  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");
  const { createNewsletterMutation, newsletters } = useNewsletterQuery();
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);

  const isDuplicate = newsletters?.some(
    (newsletter) => newsletter.topic === topic && newsletter.reason === reason
  );

  const isInvalid = !topic.trim() || !reason.trim() || isDuplicate;

  const handleCreateNewsletter = () => {
    if (admin?.sub) {
      setIsProgressDialogOpen(true);
      createNewsletterMutation.mutate(
        {
          adminID: admin.sub,
          topic,
          reason,
        },
        {
          onSuccess: () => {
            setTopic("");
            setReason("");
            setIsProgressDialogOpen(false);
          },
          onError: () => {
            setIsProgressDialogOpen(false);
          },
        }
      );
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <TextField
        label="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{ marginRight: "16px" }}
      />
      <TextField
        label="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        style={{ marginRight: "16px" }}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={isInvalid}
        onClick={handleCreateNewsletter}
      >
        Create Newsletter
      </Button>
      {isDuplicate && (
        <p>A newsletter with this topic and reason already exists.</p>
      )}
      <ProgressDialog
        isOpen={isProgressDialogOpen}
        message="Creating your newsletter. Please wait..."
      />
    </div>
  );
};

export default NewsletterForm;
