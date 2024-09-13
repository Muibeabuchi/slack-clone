"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import useCurrentMember from "@/features/members/api/use-current-member";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import {
  AlertTriangleIcon,
  HashIcon,
  Loader,
  MessageSquareTextIcon,
  SendHorizonalIcon,
} from "lucide-react";
import WorkspaceHeader from "./workspace-header";
import { SidebarItem } from "./sidebar-item";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";

export default function WorkspaceSidebar({
  channelsPreloadQuery,
}: {
  channelsPreloadQuery?: Preloaded<typeof api.channels.get> | string;
}) {
  const workspaceId = useWorkspaceId();

  // ?preload data from the server
  // const channels = usePreloadedQuery(channelsPreloadQuery);

  const { data: channels, isLoading: isLoadingChannels } = useGetChannels({
    workspaceId,
  });

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
      <WorkspaceSection hint="New Channel" label="Channels" onNew={() => {}}>
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            variant="default"
            icon={HashIcon}
            label={item?.chanelName}
            id={item._id}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
}
