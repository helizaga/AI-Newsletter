import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

interface PayloadType {
  // Define the structure of your payload here
  [key: string]: any;
}

export const handleEmailOperation = async (
  apiEndpoint: string,
  payload: PayloadType
) => {
  try {
    await axios.post(`${API_BASE_URL}${apiEndpoint}`, payload);
  } catch (error) {
    console.error(`Operation failed: ${error}`);
  }
};

export const fetchEmails = async (adminId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/get-emails?adminId=${adminId}`
  );
  return response.data.mailingList;
};

export const fetchNewsletters = async (adminId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/get-newsletters?adminId=${adminId}`
  );
  return response.data;
};

export const createNewsletter = async (payload: PayloadType) => {
  const response = await axios.post(
    `${API_BASE_URL}/create-newsletter`,
    payload
  );
  return response.data;
};

export const addEmails = async (adminID: string, emailListToAdd: string[]) => {
  await axios.post(`${API_BASE_URL}/add-emails`, {
    adminID,
    emailList: emailListToAdd,
  });
};

export const deleteSelectedEmails = async (
  adminID: string,
  emailsToDelete: string[]
) => {
  await axios.post(`${API_BASE_URL}/delete-selected-emails`, {
    adminID,
    emailsToDelete,
  });
};

export const deleteNewsletter = async (newsletterId: string) => {
  await axios.delete(`${API_BASE_URL}/delete-newsletter/${newsletterId}`);
};

export const sendNewsletter = async (newsletterId: string) => {
  await axios.post(`${API_BASE_URL}/send-newsletter`, { newsletterId });
};

export const regenerateNewsletter = async (
  newsletterId: string,
  adminID: string
) => {
  const response = await axios.post(`${API_BASE_URL}/regenerate-newsletter`, {
    newsletterId,
    adminID,
  });
  return response.data;
};
