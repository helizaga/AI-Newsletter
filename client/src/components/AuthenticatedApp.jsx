import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import LogoutButton from "./LogoutButton";
import axios from "axios";
import {
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const API_BASE_URL = "http://localhost:3001/api";

// Fetch emails
const fetchEmails = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/get-emails?id=${id}`);
  return response.data.emailsToSendTo;
};
// Fetch newsletters
const fetchNewsletters = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/get-newsletters?id=${id}`);
  return response.data;
};

const AuthenticatedApp = ({ user }) => {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [emailInput, setEmailInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);

  // react-query for fetching emails
  const { data: emailList, refetch: refetchEmails } = useQuery(
    ["emails", user.sub],
    () => fetchEmails(user.sub)
  );

  // react-query for fetching newsletters
  const { data: newsletters } = useQuery(["newsletters", user.sub], () =>
    fetchNewsletters(user.sub)
  );

  // Mutation for creating a newsletter
  const createNewsletterMutation = useMutation(
    async (payload) => {
      const response = await axios.post(
        `${API_BASE_URL}/create-newsletter`,
        payload
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["newsletters", user.sub]);
      },
    }
  );

  const handleAddEmailsClick = async () => {
    const isMultipleEmails = emailInput.includes(",");
    const emailListToAdd = isMultipleEmails
      ? emailInput.split(",")
      : [emailInput];

    try {
      await axios.post(`${API_BASE_URL}/add-emails`, {
        id: user.sub,
        emailList: emailListToAdd,
      });
      refetchEmails(); // Refetch Manually
    } catch (error) {
      console.error(
        `Failed to add emails: ${emailListToAdd.join(", ")}`,
        error
      );
    }
  };

  const handleEmailSelection = (email) => {
    const newSelectedEmails = new Set(selectedEmails);
    if (newSelectedEmails.has(email)) {
      newSelectedEmails.delete(email);
    } else {
      newSelectedEmails.add(email);
    }
    setSelectedEmails(newSelectedEmails);
  };

  const handleDeleteSelectedEmails = async () => {
    try {
      await axios.post(`${API_BASE_URL}/delete-selected-emails`, {
        id: user.sub,
        emailsToDelete: Array.from(selectedEmails),
      });
      console.log("Deleted selected emails");
      // Refresh the email list
      refetchEmails();
    } catch (error) {
      console.error("Failed to delete selected emails:", error);
    }
  };

  const deleteNewsletter = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/delete-newsletter/${id}`);
      queryClient.invalidateQueries(["newsletters", user.sub]);
    } catch (error) {
      console.error(`Failed to delete newsletter with ID ${id}`, error);
    }
  };
  return (
    <>
      <LogoutButton />
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
            createNewsletterMutation.mutate({
              id: user.sub,
              topic,
              reason,
            });
          }}
        >
          Create Newsletter
        </Button>
      </div>
      <div>
        <Typography variant="h6">Your Newsletters</Typography>
        <List>
          {Array.isArray(newsletters) &&
            newsletters.map((newsletter, index) => (
              <ListItem
                key={index}
                onClick={() => {
                  setSelectedNewsletter(newsletter);
                  setIsModalOpen(true);
                }}
              >
                <Typography variant="h6" style={{ marginRight: "4px" }}>
                  {newsletter.topic}
                </Typography>
                <Typography variant="h6" style={{ marginRight: "12px" }}>
                  {newsletter.reason}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNewsletter(newsletter.id);
                  }}
                >
                  Delete
                </Button>
              </ListItem>
            ))}
        </List>
      </div>
      <div style={{ margin: "20px 0" }}>
        <TextField
          type="text"
          label="Add Email(s) (comma separated for multiple)"
          variant="outlined"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddEmailsClick}
          style={{ marginTop: "10px" }}
        >
          Add Email(s)
        </Button>
      </div>
      <div>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDeleteSelectedEmails} // Use the new handler
        >
          Delete Selected Emails
        </Button>
      </div>
      <div>
        <Typography variant="h6">Emails to Send To:</Typography>
        <List>
          {Array.isArray(emailList) &&
            emailList.map((email, index) => (
              <ListItem key={index}>
                <Checkbox
                  checked={selectedEmails.has(email)}
                  onChange={() => handleEmailSelection(email)}
                />
                <Typography variant="body2">{email}</Typography>
              </ListItem>
            ))}
        </List>
      </div>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>{selectedNewsletter?.searchQuery}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{selectedNewsletter?.content}</Typography>{" "}
          {/* Here's where we display the content */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuthenticatedApp;
