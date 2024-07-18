import { List, Typography, Box } from "@mui/material";
import { useNewsletterQuery } from "../hooks/useNewsletterQuery";
import { NewsletterItem } from "./NewsletterItem";

const NewsletterList = () => {
  const { newsletters } = useNewsletterQuery();
  return (
    <div>
      <Typography variant="h6">Your Newsletters</Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        padding="0 16px"
        marginTop="10px"
        borderBottom="1px solid #ccc"
        paddingBottom="5px"
      ></Box>
      <List>
        {Array.isArray(newsletters) &&
          newsletters.map((newsletter, index) => (
            <NewsletterItem key={index} newsletter={newsletter} />
          ))}
      </List>
    </div>
  );
};

export default NewsletterList;
