import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { Message } from "./message";
import { ChannelHero } from "./channel-hero";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import useCurrentMember from "@/features/members/api/use-current-member";
import { Loader } from "lucide-react";

type MessageVariant = "channel" | "conversation" | "thread";

type MessageListProps = {
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: number;
  variant?: MessageVariant;
  data: GetMessagesReturnType | undefined;
  loadMore: () => void;
  canLoadMore: boolean;
  isLoadingMore: boolean;
};

const TIME_THRESHOLD = 5;

function formatDateLabel(datestring: string) {
  const date = new Date(datestring);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE,MMMM,d");
}

export default function MessageList({
  canLoadMore,
  data,
  isLoadingMore,
  loadMore,
  channelCreationTime,
  channelName,
  memberImage,
  memberName,
  variant = "channel",
}: MessageListProps) {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });

  const groupedMessages = data?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof data>
  );
  return (
    <div className="flex-1  flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
      {Object.entries(groupedMessages || {}).map(([datekey, messages]) => (
        <div key={datekey}>
          <div className="my-2 text-center relative">
            <hr className="absolute top-1/2 left-0 right-0 border-top border-gray-300 " />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              {formatDateLabel(datekey)}
            </span>
          </div>

          {messages.map((message, index) => {
            const previousMessage = messages[index - 1];
            const isCompact =
              previousMessage &&
              previousMessage.user._id === message.user._id &&
              differenceInMinutes(
                new Date(message._creationTime),
                new Date(previousMessage._creationTime)
              ) < TIME_THRESHOLD;
            return (
              <Message
                key={message._id}
                id={message._id}
                memberId={message.memberId}
                authorName={message.user.name}
                isAuthor={message.memberId === currentMember?._id}
                authorImage={message.user.image}
                reactions={message.reactions}
                body={message.body}
                image={message.image}
                updatedAt={message.updatedAt}
                createdAt={message._creationTime}
                threadCount={message.threadCount}
                threadImage={message.threadImage}
                threadTimeStamp={message.threadTimestamp}
                isEditing={editingId === message._id}
                setEditingId={setEditingId}
                isCompact={isCompact}
                hideThreadButton={variant === "thread"}
              />
            );
          })}
        </div>
      ))}

      <div
        className="h-1"
        ref={(el) => {
          if (el) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry && canLoadMore) {
                  loadMore();
                }
              },
              { threshold: 1.0 }
            );
            observer.observe(el);
            return () => observer.disconnect();
          }
        }}
      />
      {isLoadingMore && (
        <div className="my-2 text-center relative">
          <hr className="absolute top-1/2 left-0 right-0 border-top border-gray-300 " />
          <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
            <Loader className="size-4 animate-spin" />
          </span>
        </div>
      )}
      {variant === "channel" && channelName && channelCreationTime ? (
        <ChannelHero name={channelName} creationTime={channelCreationTime} />
      ) : null}
    </div>
  );
}
