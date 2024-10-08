import { AlertTriangle, Loader, XIcon } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useGetMessageById } from "../api/use-get-message-by-id";
import { Message } from "@/components/message";
import useCurrentMember from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useState } from "react";

interface ThreadsProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

export const Threads = ({ messageId, onClose }: ThreadsProps) => {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: loadingMessage } = useGetMessageById({
    messageId,
  });

  if (loadingMessage) {
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
  );
};
