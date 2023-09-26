import { useQuery, useMutation, useQueryClient } from "react-query";
import { fetchNewsletters, createNewsletter } from "../services/apiService";
import { useAdmin } from "../contexts/AdminContext";
import { Newsletter } from "../types/common";

export const useNewsletterQuery = () => {
  const admin = useAdmin();
  const queryClient = useQueryClient();
  const queryKeyForNewsletters = ["newsletters", admin?.sub];
  const fetchNewslettersForAdmin = () => fetchNewsletters(admin?.sub as string);
  const invalidateNewslettersQuery = () =>
    queryClient.invalidateQueries(queryKeyForNewsletters);

  const { data: newsletters } = useQuery<Newsletter[]>(
    queryKeyForNewsletters,
    fetchNewslettersForAdmin
  );
  const createNewsletterMutation = useMutation(createNewsletter, {
    onError: (error: unknown) => {
      const typedError = error as { message: string };
      if (
        typedError.message.includes("Unique constraint failed on the fields")
      ) {
        alert("A newsletter with this topic and reason already exists.");
      }
    },
    onSuccess: invalidateNewslettersQuery,
  });

  return { newsletters, createNewsletterMutation };
};
