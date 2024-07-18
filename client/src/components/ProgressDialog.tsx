import React, { FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Typography,
} from "@mui/material";

interface ProgressDialogProps {
  isOpen: boolean;
  message: string;
}

const ProgressDialog: FC<ProgressDialogProps> = ({ isOpen, message }) => {
  return (
    <Dialog open={isOpen}>
      <DialogTitle>Processing</DialogTitle>
      <DialogContent style={{ textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" style={{ marginTop: "20px" }}>
          {message}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog;
