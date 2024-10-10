import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronRightIcon } from "lucide-react";

interface ThreadBarProps {
  count?: number;
  image?: string;
  name?: string;
  timestamp?: number;
  onClick: () => void;
}

export const ThreadBar = ({
  onClick,
  count,
  image,
  timestamp,
  name,
}: ThreadBarProps) => {
  console.log(name);
  const avatarFallback = name?.charAt(0).toUpperCase();
  if (!count || !timestamp) return null;

  return (
    <button
      onClick={onClick}
      className="p-1 rounded-md hover:bg-white border-transparent hover:border-border flex items-center justify-start group/thread-bar transition max-w-[600px]"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={image} />
          <AvatarFallback className="rounded-md bg-sky-500 text-white">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm hover:underline font-bold truncate text-sky-700">
          {count} {count > 1 ? "replies" : "reply"}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:hidden block ">
          last reply {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:block hidden">
          View Thread
        </span>
      </div>
      <ChevronRightIcon className="size-4 text-muted-foreground ml-auto group-hover/thread-bar opacity-0 opacity-100 transition shrink-0" />
    </button>
  );
};
