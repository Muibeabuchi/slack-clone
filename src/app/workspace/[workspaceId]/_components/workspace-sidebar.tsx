"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import useCurrentMember from "@/features/members/api/use-current-member";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import {
  AlertTriangleIcon,
  Loader,
  MessageSquareTextIcon,
  SendHorizonalIcon,
} from "lucide-react";
import WorkspaceHeader from "./workspace-header";
import { SidebarItem } from "./sidebar-item";

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
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem
          label="Threads"
          icon={MessageSquareTextIcon}
          id="threads"
          variant="active"
        />
        <SidebarItem
          label="Drafts and sent"
          icon={SendHorizonalIcon}
          id="drafts"
        />
      </div>
    </div>
  );
}
