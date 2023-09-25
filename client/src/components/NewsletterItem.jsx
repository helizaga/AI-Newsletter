import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { ListItem, Button, Typography } from "@mui/material";

import ConfirmSendDialog from "./ConfirmSendDialog";
import NewsletterDetailDialog from "./NewsletterDetailDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import {
  deleteNewsletter,
  sendNewsletter,
  regenerateNewsletter,
} from "../services/apiService";
import { useAdmin } from "../contexts/AdminContext";

// Extracted into a separate component
export const NewsletterItem = ({ newsletter }) => {
  const queryClient = useQueryClient();
  const admin = useAdmin();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSendNewsletterClick = async () => {
    try {
      await sendNewsletter(newsletter.id);
      console.log(`Newsletter with ID ${newsletter.id} sent`);
    } catch (error) {
      console.error(
        `Failed to send newsletter with ID ${newsletter.id}`,
        error
      );
    }
  };

  const handleDeleteNewsletter = async () => {
    try {
      await deleteNewsletter(newsletter.id);
      queryClient.invalidateQueries(["newsletters", admin.sub]);
    } catch (error) {
      console.error(
        `Failed to delete newsletter with ID ${newsletter.id}`,
        error
      );
    }
  };

  const handleRegenerateNewsletter = async () => {
    try {
      const regeneratedNewsletter = await regenerateNewsletter(
        newsletter.id,
        admin.sub
      );
      console.log(
        `Newsletter with ID ${newsletter.id} regenerated`,
        regeneratedNewsletter
      );
    } catch (error) {
      console.error(
        `Failed to regenerate newsletter with ID ${newsletter.id}`,
        error
      );
    }
  };

  return (
    <>
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          handleDeleteNewsletter();
          setDeleteDialogOpen(false);
        }}
      />
      <ListItem>
        <div style={{ cursor: "pointer" }}>
          <Typography variant="h6" style={{ marginRight: "4px" }}>
            {newsletter.topic}
          </Typography>
          <Typography variant="h6" style={{ marginRight: "12px" }}>
            {newsletter.reason}
          </Typography>
          <NewsletterDetailDialog newsletter={newsletter} />
        </div>
        <ConfirmSendDialog onConfirm={handleSendNewsletterClick} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleRegenerateNewsletter}
        >
          Regenerate
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete
        </Button>
      </ListItem>
    </>
  );
};
