import {
  MessageSquareTextIcon,
  PencilIcon,
  Smile,
  TrashIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import Hint from "./hint";
import EmojiPicker from "./emoji-popover";

interface ToolbarProps {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
  handleThread: () => void;
  handleReaction: (value: string) => void;
  hideThreadButton: boolean;
}

export const Toolbar = ({
  handleDelete,
  handleEdit,
  handleReaction,
  handleThread,
  hideThreadButton,
  isAuthor,
  isPending,
}: ToolbarProps) => {
  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 transition-opacity border bg-white rounded-md shadow-sm opacity-0">
        <EmojiPicker onEmojiSelect={(emoji) => handleReaction(emoji)}>
          <Button variant="ghost" disabled={isPending} size={"iconSm"}>
            <Smile className="size-4" />
          </Button>
        </EmojiPicker>
        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button
              variant="ghost"
              disabled={isPending}
              onClick={handleThread}
              size={"iconSm"}
            >
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor ? (
          <Hint label="Edit Message">
            <Button
              variant="ghost"
              disabled={isPending}
              onClick={handleEdit}
              size={"iconSm"}
            >
              <PencilIcon className="size-4" />
            </Button>
          </Hint>
        ) : null}
        {isAuthor ? (
          <Hint label="Delete Message">
            <Button
              variant="ghost"
              disabled={isPending}
              onClick={handleDelete}
              size={"iconSm"}
            >
              <TrashIcon className="size-4" />
            </Button>
          </Hint>
        ) : null}
      </div>
    </div>
  );
};
