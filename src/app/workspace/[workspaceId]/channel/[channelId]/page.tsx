"use client";

import { LoaderIcon, TriangleAlertIcon } from "lucide-react";

import { UseGetChannelById } from "@/features/channels/api/use-get-channel-by-id";
import useChannelId from "@/hooks/use-channel-id";

import Header from "./_components/header";
import ChatInput from "./_components/chat-input";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import MessageList from "@/components/message-list";

const ChannelIdPage = () => {
  // write effect that checks if there an admin is on a workspace page with no channel and open the create channel modal
  const channelId = useChannelId();
  const { results, status, loadMore } = useGetMessages({ channelId });
  const { data: channel, isLoading: channelLoading } = UseGetChannelById({
    channelId,
  });

  if (channelLoading || status === "LoadingFirstPage") {
    return (
      <div className="flex h-full items-center justify-center flex-1">
        <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (channel === null) {
    return (
      <div className="flex flex-col gap-y-2 h-full items-center justify-center flex-1">
        <TriangleAlertIcon className="size-5 text-muted-foreground" />
        <span className="test-sm text-muted-foreground">
          Channel not found.
        </span>
      </div>
    );
  }

  if (channel) {
    return (
      <div className="flex flex-col h-full">
        <Header headerTitle={channel.chanelName} />
        <MessageList
          channelName={channel.chanelName}
          channelCreationTime={channel._creationTime}
          data={results}
          loadMore={loadMore}
          isLoadingMore={status === "LoadingMore"}
          canLoadMore={status === "CanLoadMore"}
        />
        <ChatInput placeholder={`Message #${channel.chanelName}`} />
      </div>
    );
  }
};

export default ChannelIdPage;
