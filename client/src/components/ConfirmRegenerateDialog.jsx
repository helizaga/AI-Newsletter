import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";

const ConfirmRegenerateDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Confirm Regeneration</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to regenerate this newsletter?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          color="primary"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmRegenerateDialog;
