import { useQueryState } from "nuqs";

export const useProfileMemberId = () =>
  useQueryState("profileMemberId", { history: "push" });
