"use client";

import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
// import { useEffect } from "react";

// interface WorkspaceIdProps {
//   params: {
//     workspaceId: Id<"workspaces">;
//   };
// }

const WorkspaceIdPage = () => {
  const workspaceId = useWorkspaceId();

  // useEffect(()=>{
  //   if
  // })

  return <div>ID:{workspaceId}</div>;
};

export default WorkspaceIdPage;
