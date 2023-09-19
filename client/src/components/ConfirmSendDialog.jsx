import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const ConfirmSendDialog = ({ onConfirm }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Send Newsletter
      </Button>
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle>Confirm Send</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to send this newsletter?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmSendDialog;
