import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const useGetWorkspaceInfo = (workspaceId: Id<"workspaces">) => {
  const workspaceInfo = useQuery(api.workspaces.getWorkspaceInfo, {
    workspaceId,
  });

  const isLoading = workspaceInfo === undefined;

  return {
    isLoading,
    workspaceInfo,
  };
};

export default useGetWorkspaceInfo;
