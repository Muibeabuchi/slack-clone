"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import useCurrentMember from "@/features/members/api/use-current-member";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import { AlertTriangleIcon, Loader } from "lucide-react";
import WorkspaceHeader from "./workspace-header";

export default function WorkspaceSidebar() {
  const workspaceId = useWorkspaceId();
  const { data: currentMember, isLoading: CurrentMemberLoading } =
    useCurrentMember({ workspaceId });
  const { data: workSpace, isLoading: WorkspaceLoading } =
    useGetWorkspace(workspaceId);

  if (WorkspaceLoading || CurrentMemberLoading) {
    return (
      <div className="flex flex-col bg-[#5e2c5f] h-full items-center justify-center">
        <Loader className="animate-spin  size-5 text-white" />
      </div>
    );
  }
  if (!workSpace || !currentMember) {
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
