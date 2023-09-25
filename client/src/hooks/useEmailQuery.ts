import { useQuery } from "react-query";
import { fetchEmails } from "../services/apiService";
import { useAdmin } from "../contexts/AdminContext";

export const useEmailQuery = () => {
  const admin = useAdmin();
  const queryKeyForEmails = ["emails", admin?.sub];
  const fetchEmailsForAdmin = () => fetchEmails(admin?.sub as string);

  const { data: emailList, refetch: refetchEmails } = useQuery(
    queryKeyForEmails,
    fetchEmailsForAdmin
  );

  return { emailList, refetchEmails };
};
