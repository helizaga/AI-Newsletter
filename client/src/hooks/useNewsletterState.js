// hooks/useNewsletterState.js
import { useState } from "react";

export const useNewsletterState = () => {
  const [topic, setTopic] = useState("");
  const [reason, setReason] = useState("");

  return {
    topic,
    setTopic,
    reason,
    setReason,
  };
};
