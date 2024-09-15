"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import { LoaderIcon, TriangleAlertIcon } from "lucide-react";
import useCurrentMember from "@/features/members/api/use-current-member";

export default function WorkspaceIdPage({
  params: { workspaceId },
}: {
  params: { workspaceId: Id<"workspaces"> };
}) {
  const router = useRouter();
  const { data: workspace, isLoading: workspaceLoading } =
    useGetWorkspace(workspaceId);
  const { data: currentMember, isLoading: loadingCurrentMember } =
    useCurrentMember({
      workspaceId,
    });
  const { data: channels, isLoading: loadingChannels } = useGetChannels({
    workspaceId,
  });
  const [openCreateChannel, setOpenCreateChannel] = useCreateChannelModal();

  // const firstWorkspace = useMemo(() => workspace?._id, [workspace]);
  const firstChannelId = useMemo(() => channels?.[0]?._id, [channels]);
  const isAdmin = useMemo(
    () => currentMember?.role === "admin",
    [currentMember?.role]
  );

  useEffect(() => {
    if (
      workspaceLoading ||
      loadingChannels ||
      loadingCurrentMember ||
      !currentMember ||
      !workspace
    )
      return;

    if (firstChannelId) {
      router.push(`/workspace/${workspaceId}/channel/${firstChannelId}`);
    } else if (!openCreateChannel && isAdmin) {
      setOpenCreateChannel(true);
    }
  }, [
    workspaceLoading,
    loadingChannels,
    workspace,
    router,
    workspaceId,
    firstChannelId,
    openCreateChannel,
    setOpenCreateChannel,
    loadingCurrentMember,
    isAdmin,
    currentMember,
  ]);

  if (workspaceLoading || loadingChannels || loadingCurrentMember) {
    return (
      <div className="flex-1 h-full flex flex-col gap-2 justify-center items-center">
        <LoaderIcon className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex-1 h-full flex flex-col gap-2 justify-center items-center">
        <TriangleAlertIcon className=" size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Workspace not found
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col gap-2 justify-center items-center">
      <TriangleAlertIcon className=" size-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">No Channel Found.</span>
    </div>
  );
}
