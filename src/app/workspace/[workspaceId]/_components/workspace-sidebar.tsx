"use client";

// import { useWorkspaceId } from "@/hooks/use-workspace-id";
// import useCurrentMember from "@/features/members/api/use-current-member";
// import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import {
  AlertTriangleIcon,
  // Loader
} from "lucide-react";
import WorkspaceHeader from "./workspace-header";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function WorkspaceSidebar({
  preloadedCurrentMember,
  preloadedWorkspace,
}: {
  preloadedCurrentMember: Preloaded<typeof api.members.current>;
  preloadedWorkspace: Preloaded<typeof api.workspaces.getById>;
}) {
  // ?preload all these data on the server and pass to this component to unpack

  const currentMember = usePreloadedQuery(preloadedCurrentMember);
  const workSpace = usePreloadedQuery(preloadedWorkspace);

  console.log("workspace", workSpace);
  console.log("currentMember", currentMember);

  // const workspaceId = useWorkspaceId();
  // const { data: currentMember, isLoading: CurrentMemberLoading } =
  //   useCurrentMember({ workspaceId });
  // const { data: workSpace, isLoading: WorkspaceLoading } =
  //   useGetWorkspace(workspaceId);

  // if (WorkspaceLoading || CurrentMemberLoading) {
  //   return (
  //     <div className="flex flex-col bg-[#5e2c5f] h-full items-center justify-center">
  //       <Loader className="animate-spin  size-5 text-white" />
  //     </div>
  //   );
  // }

  if (workSpace == null || currentMember == null) {
    return (
      <div className="gap-y-2 flex flex-col bg-[#5e2c5f] h-full items-center justify-center">
        <AlertTriangleIcon className=" size-5 text-white" />
        <p className="text-sm text-white">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="gap-y-2 flex flex-col bg-[#5e2c5f] h-full ">
      <WorkspaceHeader
        workspace={workSpace}
        isAdmin={currentMember.role === "admin"}
      />
    </div>
  );
}
