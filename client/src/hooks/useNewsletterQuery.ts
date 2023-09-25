import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  fetchEmails,
  fetchNewsletters,
  createNewsletter,
} from "../services/apiService";
import { useAdmin } from "../contexts/AdminContext";

export const useNewsletterQuery = () => {
  const admin = useAdmin();
  const queryClient = useQueryClient();

  const queryKeyForEmails = ["emails", admin?.sub];
  const queryKeyForNewsletters = ["newsletters", admin?.sub];

  const fetchEmailsForAdmin = () => fetchEmails(admin?.sub as string);
  const fetchNewslettersForAdmin = () => fetchNewsletters(admin?.sub as string);
  const invalidateNewslettersQuery = () =>
    queryClient.invalidateQueries(queryKeyForNewsletters);

  const { data: emailList, refetch: refetchEmails } = useQuery(
    queryKeyForEmails,
    fetchEmailsForAdmin
  );
  const { data: newsletters } = useQuery(
    queryKeyForNewsletters,
    fetchNewslettersForAdmin
  );
  const createNewsletterMutation = useMutation(createNewsletter, {
    onSuccess: invalidateNewslettersQuery,
  });

  return {
    emailList,
    refetchEmails,
    newsletters,
    createNewsletterMutation,
  };
};
