import React, { useState, FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface Newsletter {
  id: string;
  topic: string;
  reason: string;
  searchQuery: string;
  content: string;
  // add other fields here
}

const NewsletterDetailDialog: FC<{ newsletter: Newsletter }> = ({
  newsletter,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        View Details
      </Button>
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle>{newsletter?.searchQuery}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{newsletter?.content}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewsletterDetailDialog;
