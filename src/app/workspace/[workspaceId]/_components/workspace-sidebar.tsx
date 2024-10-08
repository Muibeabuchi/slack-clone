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
// import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";
import UserItem from "./user-item";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import useChannelId from "@/hooks/use-channel-id";
import useMemberId from "@/hooks/use-member-id ";

export default function WorkspaceSidebar({
  channelsPreloadQuery,
  membersPreloadQuery,
}: {
  channelsPreloadQuery: Preloaded<typeof api.channels.get>;
  membersPreloadQuery: Preloaded<typeof api.members.workspaceMembers>;
}) {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();

  // ?preload channels data from the server
  const channels = usePreloadedQuery(channelsPreloadQuery);
  // ?preload workspaceMemebers data from the server
  const members = usePreloadedQuery(membersPreloadQuery);

  // const { data: channels, isLoading: isLoadingChannels } = useGetChannels({
  //   workspaceId,
  // });

  const [, setOpen] = useCreateChannelModal();

  // TODO: CHANGE THIS APIS TO PRELOAD ON THE SERVER
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
      <div className="flex flex-col px-2 mt-3 gap-y-1.5">
        <SidebarItem
          label="Threads"
          icon={MessageSquareTextIcon}
          id="threads"
          // variant="active"
        />
        <SidebarItem
          label="Drafts and sent"
          icon={SendHorizonalIcon}
          id="drafts"
        />
      </div>
      <WorkspaceSection
        hint="New Channel"
        label="Channels"
        onNew={currentMember.role === "admin" ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            variant={channelId === item._id ? "active" : "default"}
            icon={HashIcon}
            label={item?.chanelName}
            id={item._id}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection
        hint="New Direct message"
        label="Direct Messages"
        onNew={() => {}}
      >
        {members?.map((item) => (
          <UserItem
            id={item._id}
            image={item.userData?.image}
            key={item._id}
            label={item.userData?.name}
            variant={memberId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
}
