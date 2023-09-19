import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const NewsletterDetailDialog = ({ newsletter }) => {
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
