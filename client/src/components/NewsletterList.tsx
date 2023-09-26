// NewsletterList.js
import { List, Typography } from "@mui/material";

import { useNewsletterQuery } from "../hooks/useNewsletterQuery";
import { NewsletterItem } from "./NewsletterItem";

const NewsletterList = () => {
  const { newsletters } = useNewsletterQuery();
  console.log(newsletters);
  return (
    <div>
      <Typography variant="h6">Your Newsletters</Typography>
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
