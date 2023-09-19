import React, { useState } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  Checkbox,
  Typography,
} from "@mui/material";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

const EmailList = ({ user, emailList, refetchEmails }) => {
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [emailInput, setEmailInput] = useState("");

  const handleAddEmails = async () => {
    const emails = emailInput.includes(",")
      ? emailInput.split(",")
      : [emailInput];
    try {
      await axios.post(`${API_BASE_URL}/add-emails`, {
        id: user?.sub,
        emailList: emails,
      });
      refetchEmails();
    } catch (error) {
      console.error(`Failed to add emails: ${emails.join(", ")}`, error);
    }
  };

  const toggleEmailSelection = (email) => {
    setSelectedEmails((prev) => {
      const updated = new Set(prev);
      updated.has(email) ? updated.delete(email) : updated.add(email);
      return updated;
    });
  };

  const handleDeleteEmails = async () => {
    if (!user?.sub) {
      console.error("User ID is undefined");
      return;
    }

    const emails = Array.from(selectedEmails);
    if (emails.length === 0) {
      console.error("No emails selected for deletion");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/delete-selected-emails`, {
        id: user.sub,
        emailsToDelete: emails,
      });
      refetchEmails();
    } catch (error) {
      console.error("Failed to delete selected emails:", error);
    }
  };

  return (
    <div>
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
          onClick={handleAddEmails}
          style={{ marginTop: "10px" }}
        >
          Add Email(s)
        </Button>
      </div>
      <Typography variant="h6">Emails to Send To:</Typography>
      <List>
        {emailList?.map((email, index) => (
          <ListItem key={index}>
            <Checkbox
              checked={selectedEmails.has(email)}
              onChange={() => toggleEmailSelection(email)}
            />
            <Typography variant="body2">{email}</Typography>
          </ListItem>
        ))}
      </List>
      <div>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDeleteEmails}
          disabled={selectedEmails.size === 0}
        >
          Delete Selected Emails
        </Button>
      </div>
    </div>
  );
};

export default EmailList;
