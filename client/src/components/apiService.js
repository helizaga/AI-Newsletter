import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

export const fetchEmails = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/get-emails?id=${id}`);
  return response.data.emailsToSendTo;
};

export const fetchNewsletters = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/get-newsletters?id=${id}`);
  return response.data;
};

export const createNewsletter = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}/create-newsletter`,
    payload
  );
  return response.data;
};

export const addEmails = async (id, emailListToAdd) => {
  await axios.post(`${API_BASE_URL}/add-emails`, {
    id,
    emailList: emailListToAdd,
  });
};

export const deleteSelectedEmails = async (id, emailsToDelete) => {
  await axios.post(`${API_BASE_URL}/delete-selected-emails`, {
    id,
    emailsToDelete,
  });
};

export const deleteNewsletter = async (id) => {
  await axios.delete(`${API_BASE_URL}/delete-newsletter/${id}`);
};

export const sendNewsletter = async (newsletterId) => {
  await axios.post(`${API_BASE_URL}/send-newsletter`, { newsletterId });
};
