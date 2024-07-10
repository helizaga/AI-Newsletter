import { useState, FC } from "react";
import { useQueryClient } from "react-query";
import { ListItem, Button, Typography } from "@mui/material";

import ConfirmSendDialog from "./ConfirmSendDialog";
import NewsletterDetailDialog from "./NewsletterDetailDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import ConfirmRegenerateDialog from "./ConfirmRegenerateDialog";
import {
  deleteNewsletter,
  sendNewsletter,
  regenerateNewsletter,
} from "../services/apiService";
import { useAdmin } from "../contexts/AdminContext";
import { Newsletter } from "../types/common";

// Extracted into a separate component
export const NewsletterItem: FC<{ newsletter: Newsletter }> = ({
  newsletter,
}) => {
  const queryClient = useQueryClient();
  const admin = useAdmin();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);

  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  const handleSendNewsletterClick = async () => {
    try {
      await sendNewsletter(newsletter.id);
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
      queryClient.invalidateQueries(["newsletters", admin?.sub]);
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
        admin?.sub as string
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
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          handleDeleteNewsletter();
          setDeleteDialogOpen(false);
        }}
      />
      <ConfirmSendDialog
        isOpen={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        onConfirm={handleSendNewsletterClick}
      />
      <ConfirmRegenerateDialog
        isOpen={regenerateDialogOpen}
        onClose={() => setRegenerateDialogOpen(false)}
        onConfirm={handleRegenerateNewsletter}
      />
      <ListItem>
        <Typography variant="h6" style={{ marginRight: "4px" }}>
          {newsletter.topic}
        </Typography>
        <Typography variant="h6" style={{ marginRight: "12px" }}>
          {newsletter.reason}
        </Typography>
        <NewsletterDetailDialog newsletter={newsletter} />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setSendDialogOpen(true)}
        >
          Send Newsletter
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setRegenerateDialogOpen(true)}
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
