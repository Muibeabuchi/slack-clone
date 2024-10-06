import dynamic from "next/dynamic";

import { Doc, Id } from "../../convex/_generated/dataModel";
import { format, isToday, isYesterday } from "date-fns";
import Hint from "./hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Renderer = dynamic(() => import("@/components/renderer"), {
  ssr: false,
});
const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorName?: string;
  authorImage?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadCount?: boolean;
  threadCount?: number;
  isEditing: boolean;
  hideThreadButton: boolean;
  threadImage?: string;
  threadTimeStamp?: number;
}

function formatFullTime(date: Date) {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")}at  ${format(date, "h:mm:ss a")}`;
}

export const Message = ({
  body,
  createdAt,
  id,
  image,
  isAuthor,
  memberId,
  reactions,
  updatedAt,
  authorImage,
  authorName = "Member",
  hideThreadCount,
  isCompact,
  threadCount,
  threadImage,
  threadTimeStamp,
  hideThreadButton,
  isEditing,
  setEditingId,
}: MessageProps) => {
  const avatarFallback = authorName.charAt(0).toUpperCase();
  const { mutate: updateMessage, isPending: updatingMessage } =
    useUpdateMessage();

  const isUpdating = updatingMessage;

  const handleUpdateMessage = ({ body }: { body: string }) => {
    updateMessage(
      { body, messageId: id },
      {
        onSuccess: () => {
          toast.success("Message updates successfully");
          setEditingId(null);
        },
        onError: () => {
          toast.error("Failed to update message");
        },
      }
    );
  };

  if (isCompact) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]"
        )}
      >
        <div className="flex items-start gap-2">
          <Hint label={formatFullTime(new Date(createdAt))}>
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
              {format(new Date(createdAt), "hh:mm")}
            </button>
          </Hint>
          {isEditing ? (
            <div className="h-full w-full">
              <Editor
                onSubmit={handleUpdateMessage}
                disabled={isUpdating}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full ">
              <Renderer value={body} />
              <Thumbnail url={image} />
              {updatedAt ? (
                <span className="text-xs text-muted-foregrund">(edited)</span>
              ) : null}
            </div>
          )}
          Gg
        </div>
        {!isEditing ? (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isUpdating}
            handleEdit={() => setEditingId(id)}
            handleThread={() => {}}
            handleDelete={() => {}}
            handleReaction={() => {}}
            hideThreadButton={hideThreadButton}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]"
      )}
    >
      <div className="flex items-start gap-2">
        <button>
          <Avatar className=" rounded-md">
            <AvatarImage className="rounded-md" src={authorImage} />
            <AvatarFallback className="rounded-md bg-sky-500 text-white">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </button>
        {isEditing ? (
          <div className="h-full w-full">
            <Editor
              onSubmit={handleUpdateMessage}
              disabled={isUpdating}
              defaultValue={JSON.parse(body)}
              onCancel={() => setEditingId(null)}
              variant="update"
            />
          </div>
        ) : (
          <div className="flex flex-col w-full overflow-hidden">
            <div className="text-sm">
              <button
                className="font-bold hover:underline text-primary"
                onClick={() => {}}
              >
                {authorName}
              </button>
              <span>&nbsp;&nbsp;</span>
              <Hint label={formatFullTime(new Date(createdAt))}>
                <button
                  className="text-xs hover:underline text-muted-foreground"
                  //   onClick={() => {}}
                >
                  {format(new Date(createdAt), "h:mm a")}
                </button>
              </Hint>
            </div>
            <Renderer value={body} />
            <Thumbnail url={image} />
            {updatedAt ? (
              <span className="text-xs text-muted-foreground">(edited)</span>
            ) : null}
          </div>
        )}
      </div>
      {!isEditing ? (
        <Toolbar
          isAuthor={isAuthor}
          isPending={isUpdating}
          handleEdit={() => setEditingId(id)}
          handleThread={() => {}}
          handleDelete={() => {}}
          handleReaction={() => {}}
          hideThreadButton={hideThreadButton}
        />
      ) : null}
    </div>
  );
};
