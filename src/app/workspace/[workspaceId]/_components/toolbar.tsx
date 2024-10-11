"use client";

// import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { Info, Search } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface ToolbarProps {
  workspaceName: string;
  channelsPreloadQuery: Preloaded<typeof api.channels.get>;
  membersPreloadQuery: Preloaded<typeof api.members.workspaceMembers>;
}

const Toolbar = ({
  workspaceName,
  channelsPreloadQuery,
  membersPreloadQuery,
}: ToolbarProps) => {
  const workspaceId = useWorkspaceId();

  const router = useRouter();

  function navigateToMembers(memberId: Id<"members">) {
    router.push(`/workspace/${workspaceId}/member/${memberId}`);
    setOpen(false);
  }
  function navigateToChannels(channelId: Id<"channels">) {
    router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    setOpen(false);
  }

  // ?preload channels data from the server
  const channels = usePreloadedQuery(channelsPreloadQuery);
  // ?preload workspaceMemebers data from the server
  const members = usePreloadedQuery(membersPreloadQuery);

  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1" />
      <div className="min-w-[280px] max-w-[642px] grow-[2] shrink">
        <Button
          onClick={() => setOpen(true)}
          className="bg-accent/25 hover:bg-accent/25 w-full justify-start h-7 px-2"
          size="sm"
        >
          <Search className="size-4 text-white mr-2" />
          <span className="text-white text-xs">Search {workspaceName}</span>
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Channels" className="space-y-2">
            {channels?.map((channel) => (
              <CommandItem
                onSelect={() => navigateToChannels(channel._id)}
                key={channel._id}
              >
                {channel.chanelName}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Members" className="space-y-2">
            {members?.map((member) => (
              <CommandItem
                key={member._id}
                onSelect={() => navigateToMembers(member._id)}
              >
                {member.userData?.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <div className="ml-auto flex-1 flex items-center justify-end">
        <Button variant="transparent" size="iconSm">
          <Info className="size-5 text-white" />
        </Button>
      </div>
    </nav>
  );
};

export default Toolbar;
