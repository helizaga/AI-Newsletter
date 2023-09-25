// hooks/useNewsletterQuery.js
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  fetchEmails,
  fetchNewsletters,
  createNewsletter,
} from "../components/apiService";

export const useNewsletterQuery = (admin) => {
  const queryClient = useQueryClient();

  const { data: emailList, refetch: refetchEmails } = useQuery(
    ["emails", admin.sub],
    () => fetchEmails(admin.sub)
  );

  const { data: newsletters } = useQuery(["newsletters", admin.sub], () =>
    fetchNewsletters(admin.sub)
  );

  const createNewsletterMutation = useMutation(createNewsletter, {
    onSuccess: () => queryClient.invalidateQueries(["newsletters", admin.sub]),
  });

  return {
    emailList,
    refetchEmails,
    newsletters,
    createNewsletterMutation,
  };
};
