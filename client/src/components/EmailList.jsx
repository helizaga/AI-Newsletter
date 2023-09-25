import React, { useState } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  Checkbox,
  Typography,
} from "@mui/material";
import { useNewsletterQuery } from "../hooks/useNewsletterQuery";
import { useAdmin } from "../contexts/AdminContext";
import { addEmails, deleteSelectedEmails } from "../services/apiService";

const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

const EmailList = () => {
  const { sub: adminID } = useAdmin() || {};
  const { emailList, refetchEmails } = useNewsletterQuery();
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState(false);

  const handleAddEmails = async () => {
    const emails = emailInput.includes(",")
      ? emailInput.split(",")
      : [emailInput];
    if (emails.every(isValidEmail)) {
      try {
        await addEmails(adminID, emails);
        await refetchEmails();
        setEmailError(false);
      } catch (error) {
        console.error("Failed operation:", error);
      }
    } else {
      setEmailError(true);
    }
  };

  const handleDeleteEmails = async () => {
    if (!adminID || selectedEmails.size === 0) return;
    await deleteSelectedEmails(adminID, Array.from(selectedEmails));
    await refetchEmails();
  };

  const toggleEmailSelection = (email) => {
    setSelectedEmails((prev) => {
      const updated = new Set(prev);
      updated.has(email) ? updated.delete(email) : updated.add(email);
      return updated;
    });
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
          error={emailError}
          helperText={emailError ? "Invalid email format" : ""}
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
