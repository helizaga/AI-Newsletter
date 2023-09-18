import React, { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import axios from "axios";
import {
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  Checkbox,
} from "@mui/material";

const API_BASE_URL = "http://localhost:3001/api";

const useFetchData = (endpoint, dependencies) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
        if (response.data && Array.isArray(response.data.emailsToSendTo)) {
          setData(response.data.emailsToSendTo);
        }
      } catch (error) {
        console.error(`Failed to fetch data from ${endpoint}:`, error);
      }
    };
    fetchData();
  }, [endpoint, ...dependencies]);

  return data;
};

const handleAPIRequest = async (
  endpoint,
  payload,
  successMessage,
  failureMessage
) => {
  try {
    await axios.post(`${API_BASE_URL}/${endpoint}`, payload);
    console.log(successMessage);
  } catch (error) {
    console.error(`${failureMessage}:`, error);
  }
};

const AuthenticatedApp = ({ user }) => {
  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [emailList, setEmailList] = useState([]);
  const [emailInput, setEmailInput] = useState("");

  const [refreshFlag, setRefreshFlag] = useState(false);

  const fetchedEmailList = useFetchData(`get-emails?email=${user.email}`, [
    user.email,
    refreshFlag, // Add refreshFlag as a dependency
  ]);

  useEffect(() => {
    setEmailList(fetchedEmailList);
  }, [fetchedEmailList]);

  const newsletters = useFetchData(`get-newsletters?email=${user.email}`, [
    user.email,
  ]);

  const handleAddEmailsClick = async () => {
    const isMultipleEmails = emailInput.includes(",");
    const emailListToAdd = isMultipleEmails
      ? emailInput.split(",")
      : [emailInput];

    try {
      const response = await axios.post(`${API_BASE_URL}/add-emails`, {
        email: user.email,
        emailList: emailListToAdd,
      });

      if (response.data && Array.isArray(response.data.updatedEmails)) {
        setEmailList(response.data.updatedEmails);
      }
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
        email: user.email,
        emailsToDelete: Array.from(selectedEmails),
      });
      console.log("Deleted selected emails");
      setRefreshFlag(!refreshFlag); // Flip the flag to trigger re-fetch
    } catch (error) {
      console.error("Failed to delete selected emails:", error);
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
          onClick={() =>
            handleAPIRequest(
              "create-newsletter",
              { email: user.email, topic, reason },
              "Newsletter created",
              "Failed to create newsletter"
            )
          }
        >
          Create Newsletter
        </Button>
      </div>
      <div>
        <Typography variant="h6">Your Newsletters</Typography>
        <List>
          {newsletters.map((newsletter, index) => (
            <ListItem key={index}>
              <Typography variant="h6">{newsletter.title}</Typography>
              <Typography variant="body2">{newsletter.content}</Typography>
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
        <Typography variant="h6">Emails to Send To</Typography>
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
    </>
  );
};

export default AuthenticatedApp;
