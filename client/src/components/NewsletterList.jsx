// NewsletterList.js
import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { List, ListItem, Button, Typography } from "@mui/material";
import {
  deleteNewsletter,
  sendNewsletter,
  regenerateNewsletter,
} from "./apiService";
import ConfirmSendDialog from "./ConfirmSendDialog";
import NewsletterDetailDialog from "./NewsletterDetailDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

const NewsletterList = ({ newsletters, admin }) => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNewsletterId, setSelectedNewsletterId] = useState(null);

  const handleSendNewsletterClick = async (newsletterId) => {
    try {
      await sendNewsletter(newsletterId);
      console.log(`Newsletter with ID ${newsletterId} sent`);
    } catch (error) {
      console.error(`Failed to send newsletter with ID ${newsletterId}`, error);
    }
  };

  const handleDeleteNewsletter = async (newsletterId) => {
    try {
      await deleteNewsletter(newsletterId);
      queryClient.invalidateQueries(["newsletters", admin.sub]);
    } catch (error) {
      console.error(
        `Failed to delete newsletter with ID ${newsletterId}`,
        error
      );
    }
  };

  const handleRegenerateNewsletter = async (newsletterId, adminID) => {
    console.log(newsletterId, adminID);
    try {
      const regeneratedNewsletter = await regenerateNewsletter(
        newsletterId,
        adminID
      );
      console.log(
        `Newsletter with ID ${newsletterId} regenerated`,
        regeneratedNewsletter
      );
    } catch (error) {
      console.error(
        `Failed to regenerate newsletter with ID ${newsletterId}`,
        error
      );
    }
  };

  return (
    <div>
      <Typography variant="h6">Your Newsletters</Typography>
      <List>
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={() => {
            handleDeleteNewsletter(selectedNewsletterId);
            setDeleteDialogOpen(false);
          }}
        />
        {Array.isArray(newsletters) &&
          newsletters.map((newsletter, index) => (
            <ListItem key={index}>
              <div style={{ cursor: "pointer" }}>
                <Typography variant="h6" style={{ marginRight: "4px" }}>
                  {newsletter.topic}
                </Typography>
                <Typography variant="h6" style={{ marginRight: "12px" }}>
                  {newsletter.reason}
                </Typography>
                <NewsletterDetailDialog newsletter={newsletter} />
              </div>
              <ConfirmSendDialog
                onConfirm={() => handleSendNewsletterClick(newsletter.id)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  handleRegenerateNewsletter(newsletter.id, admin.sub)
                }
              >
                Regenerate
              </Button>

              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setSelectedNewsletterId(newsletter.id);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete
              </Button>
            </ListItem>
          ))}
      </List>
    </div>
  );
};

export default NewsletterList;
