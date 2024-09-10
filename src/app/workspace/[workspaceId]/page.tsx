"use client";

import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";

// interface WorkspaceIdProps {
//   params: {
//     workspaceId: Id<"workspaces">;
//   };
// }

const WorkspaceIdPage = () => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetWorkspace(workspaceId);

  return <div>page:{JSON.stringify(data)}</div>;
};

export default WorkspaceIdPage;
