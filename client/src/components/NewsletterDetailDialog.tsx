import React, { useState, FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

import { Newsletter } from "../types/common";

const NewsletterDetailDialog: FC<{ newsletter: Newsletter }> = ({
  newsletter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHistoryContent, setSelectedHistoryContent] = useState<
    string | null
  >(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setSelectedHistoryContent(null); // Reset selected history content on close
  };

  const handleHistoryOpen = (content: string) => {
    setSelectedHistoryContent(content); // Set selected history content
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        View Details
      </Button>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{newsletter?.searchQuery}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{newsletter?.content}</Typography>
          {newsletter.contentHistory &&
            newsletter.contentHistory.length > 0 && (
              <>
                <Typography variant="h6" style={{ marginTop: "20px" }}>
                  Content History
                </Typography>
                {newsletter.contentHistory.map((history) => (
                  <div
                    key={history.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {new Date(history.createdAt).toLocaleDateString()}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleHistoryOpen(history.content)}
                    >
                      View Content
                    </Button>
                  </div>
                ))}
                {selectedHistoryContent && (
                  <Dialog
                    open={Boolean(selectedHistoryContent)}
                    onClose={() => setSelectedHistoryContent(null)}
                  >
                    <DialogTitle>Content Detail</DialogTitle>
                    <DialogContent>
                      <Typography variant="body1">
                        {selectedHistoryContent}
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => setSelectedHistoryContent(null)}
                        color="primary"
                      >
                        Close
                      </Button>
                    </DialogActions>
                  </Dialog>
                )}
              </>
            )}
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
