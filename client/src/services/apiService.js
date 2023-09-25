import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

export const handleEmailOperation = async (apiEndpoint, payload) => {
  try {
    await axios.post(`${API_BASE_URL}${apiEndpoint}`, payload);
  } catch (error) {
    console.error(`Operation failed: ${error}`);
  }
};

export const fetchEmails = async (adminId) => {
  const response = await axios.get(
    `${API_BASE_URL}/get-emails?adminId=${adminId}`
  );
  return response.data.mailingList;
};

export const fetchNewsletters = async (adminId) => {
  const response = await axios.get(
    `${API_BASE_URL}/get-newsletters?adminId=${adminId}`
  );
  return response.data;
};

export const createNewsletter = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/create-newsletter`,
    payload
  );
  return response.data;
};

export const addEmails = async (adminID, emailListToAdd) => {
  await axios.post(`${API_BASE_URL}/add-emails`, {
    adminID,
    emailList: emailListToAdd,
  });
};

export const deleteSelectedEmails = async (adminID, emailsToDelete) => {
  await axios.post(`${API_BASE_URL}/delete-selected-emails`, {
    adminID,
    emailsToDelete,
  });
};

export const deleteNewsletter = async (newsletterID) => {
  await axios.delete(`${API_BASE_URL}/delete-newsletter/${newsletterID}`);
};

export const sendNewsletter = async (newsletterId) => {
  await axios.post(`${API_BASE_URL}/send-newsletter`, { newsletterId });
};

export const regenerateNewsletter = async (newsletterId, adminID) => {
  const response = await axios.post(`${API_BASE_URL}/regenerate-newsletter`, {
    newsletterId,
    adminID,
  });
  return response.data;
};
