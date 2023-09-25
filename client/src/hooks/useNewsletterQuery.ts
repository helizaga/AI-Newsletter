import { useQuery, useMutation, useQueryClient } from "react-query";
import { fetchNewsletters, createNewsletter } from "../services/apiService";
import { useAdmin } from "../contexts/AdminContext";

export const useNewsletterQuery = () => {
  const admin = useAdmin();
  const queryClient = useQueryClient();
  const queryKeyForNewsletters = ["newsletters", admin?.sub];
  const fetchNewslettersForAdmin = () => fetchNewsletters(admin?.sub as string);
  const invalidateNewslettersQuery = () =>
    queryClient.invalidateQueries(queryKeyForNewsletters);

  const { data: newsletters } = useQuery(
    queryKeyForNewsletters,
    fetchNewslettersForAdmin
  );
  const createNewsletterMutation = useMutation(createNewsletter, {
    onSuccess: invalidateNewslettersQuery,
  });

  return { newsletters, createNewsletterMutation };
};
