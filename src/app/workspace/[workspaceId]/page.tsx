"use client";

import { useWorkspaceId } from "@/app/hooks/use-workspace-id";

// interface WorkspaceIdProps {
//   params: {
//     workspaceId: Id<"workspaces">;
//   };
// }

const WorkspaceIdPage = () => {
  const workspaceId = useWorkspaceId();

  return <div>ID:{workspaceId}</div>;
};

export default WorkspaceIdPage;
