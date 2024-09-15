import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface useGetMembersProps {
  workspaceId: Id<"workspaces">;
}

export default function useGetMembers({ workspaceId }: useGetMembersProps) {
  const data = useQuery(api.members.workspaceMembers, {
    workspaceId,
  });

  const isLoading = data === undefined;

  return { data, isLoading };
}
