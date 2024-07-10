import axios from "axios";
import { PayloadType } from "../types/common";

const API_BASE_URL = "http://localhost:3001/api";

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
    `${API_BASE_URL}/admin/emails?adminId=${adminId}`
  );
  return response.data.mailingList;
};

export const fetchNewsletters = async (adminId: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/newsletters?adminId=${adminId}`
  );
  return response.data;
};

export const createNewsletter = async (payload: PayloadType) => {
  const response = await axios.post(
    `${API_BASE_URL}/newsletters/create`,
    payload
  );
  return response.data;
};

export const addEmails = async (adminID: string, emailListToAdd: string[]) => {
  await axios.post(`${API_BASE_URL}/admin/emails/add`, {
    adminID,
    emailList: emailListToAdd,
  });
};

export const deleteSelectedEmails = async (
  adminID: string,
  emailsToDelete: string[]
) => {
  await axios.delete(`${API_BASE_URL}/admin/emails/`, {
    data: {
      adminID,
      emailsToDelete,
    },
  });
};

export const deleteNewsletter = async (newsletterId: number) => {
  await axios.delete(`${API_BASE_URL}/newsletters/${newsletterId}`);
};

export const sendNewsletter = async (newsletterId: number) => {
  await axios.post(`${API_BASE_URL}/newsletters/send`, { newsletterId });
};

export const regenerateNewsletter = async (
  newsletterId: number,
  adminID: string
) => {
  const response = await axios.post(`${API_BASE_URL}/newsletters/regenerate`, {
    newsletterId,
    adminID,
  });
  return response.data;
};
