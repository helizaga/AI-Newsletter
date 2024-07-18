import { useState, FC } from "react";
import { useQueryClient } from "react-query";
import { ListItem, Button, Typography, Box } from "@mui/material";
import { Send, Delete, Refresh } from "@mui/icons-material";
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
      <ListItem
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #ccc",
        }}
      >
        <Box
          display="grid"
          gridTemplateColumns="200px 1fr"
          alignItems="center"
          style={{ flexGrow: 1 }}
        >
          <Typography variant="h6">Topic: {newsletter.topic}</Typography>
          <Typography style={{ marginRight: "16px" }} variant="h6">
            Reason: {newsletter.reason}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <NewsletterDetailDialog newsletter={newsletter} />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setSendDialogOpen(true)}
            startIcon={<Send />}
            style={{ marginRight: "8px", marginLeft: "8px" }}
          >
            Send Newsletter
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setRegenerateDialogOpen(true)}
            startIcon={<Refresh />}
            style={{ marginRight: "8px" }}
          >
            Regenerate
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setDeleteDialogOpen(true)}
            startIcon={<Delete />}
            style={{ marginRight: "8px" }}
          >
            Delete
          </Button>
        </Box>
      </ListItem>
    </>
  );
};
