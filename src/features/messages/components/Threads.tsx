"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Quill from "quill";

import { AlertTriangle, Loader, XIcon } from "lucide-react";

import { Id } from "../../../../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Message } from "@/components/message";

import { useGetMessageById } from "../api/use-get-message-by-id";
import { useCreateMessage } from "../api/use-create-message";

import useCurrentMember from "@/features/members/api/use-current-member";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import useChannelId from "@/hooks/use-channel-id";
import { useGetMessages } from "../api/use-get-messages";
import { differenceInMinutes, format } from "date-fns";
import { formatDateLabel, TIME_THRESHOLD } from "@/components/message-list";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ThreadsProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  body: string;
  image?: Id<"_storage">;
};

export const Threads = ({ messageId, onClose }: ThreadsProps) => {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const [editorKey, setEditorKey] = useState(0);
  const [, setIsPending] = useState(false);
  const editorRef = useRef<Quill | null>(null);

  const { mutate: createMessage, isPending: creatingMessage } =
    useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: loadingMessage } = useGetMessageById({
    messageId,
  });
  const { results, loadMore, status } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });

  const canLoadMore = status === "CanLoadMore";
  const loadingMore = status === "LoadingMore";

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      // disable the text editor
      editorRef.current?.enable(false);
      // await new Promise((resolve) => setTimeout(() => resolve(true), 7000));

      const values: CreateMessageValues = {
        body,
        channelId,
        parentMessageId: messageId,
        workspaceId,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });

        if (!url) throw new Error("url not found");

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-type": image.type },
          body: image,
        });

        if (!response.ok) throw new Error("Failed to upload image");

        const { storageId } = await response.json();
        values.image = storageId;
      }
      await createMessage(values, {
        throwError: true,
      });
      //! Destroy editor component to reset state
      setEditorKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      // unneccessary as the editor component instance is destroyed and recreated 👍
      // ref.current?.enable(false);
    }
  };

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof results>
  );

  if (loadingMessage || status === "LoadingFirstPage") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-2 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex items-center  flex-col gap-y-2 justify-center h-full w-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex flex-col h-ful">
        <div className="flex justify-between items-center p-2 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size="iconSm" variant="ghost">
            <XIcon className="size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="flex items-center flex-col gap-y-2 justify-center h-full w-full">
          <AlertTriangle className="size-5  text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button onClick={onClose} size="iconSm" variant="ghost">
          <XIcon className="size-5 stroke-[1.5]" />
        </Button>
      </div>
      <div className="flex-1  flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
        {Object.entries(groupedMessages || {}).map(([datekey, messages]) => (
          <div key={datekey}>
            <div className="my-2 text-center relative">
              <hr className="absolute top-1/2 left-0 right-0 border-top border-gray-300 " />
              <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                {formatDateLabel(datekey)}
              </span>
            </div>

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

            {loadingMore && (
              <div className="my-2 text-center relative">
                <hr className="absolute top-1/2 left-0 right-0 border-top border-gray-300 " />
                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                  <Loader className="size-4 animate-spin" />
                </span>
              </div>
            )}

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
                  threadName={message.threadName}
                  threadImage={message.threadImage}
                  threadTimeStamp={message.threadTimestamp}
                  isEditing={editingId === message._id}
                  setEditingId={setEditingId}
                  isCompact={isCompact}
                  hideThreadButton={true}
                />
              );
            })}
          </div>
        ))}

        <Message
          hideThreadButton={true}
          memberId={message.memberId}
          authorImage={message?.user.image}
          authorName={message.user.name}
          isAuthor={message.memberId === currentMember?._id}
          body={message.body}
          image={message.image}
          createdAt={message._creationTime}
          updatedAt={message.updatedAt}
          id={message._id}
          reactions={message.reactions}
          isEditing={message._id === editingId}
          setEditingId={setEditingId}
        />
      </div>
      <div className="px-4">
        <Editor
          // defaultValue={}
          variant="create"
          key={editorKey}
          innerRef={editorRef}
          onSubmit={handleSubmit}
          placeholder="Reply.."
          disabled={creatingMessage}
        />
      </div>
    </div>
  );
};
