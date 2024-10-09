import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface useGetMemberByIdProps {
  memberId: Id<"members">;
}

export default function useGetMemberById({ memberId }: useGetMemberByIdProps) {
  const data = useQuery(api.members.getById, {
    memberId,
  });

  const isLoading = data === undefined;

  return { data, isLoading };
}
