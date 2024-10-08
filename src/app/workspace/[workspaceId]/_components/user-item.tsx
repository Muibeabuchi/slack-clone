import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Id } from "../../../../../convex/_generated/dataModel";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

interface UserItemProps {
  id: Id<"members">;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof UserItemVariants>["variant"];
}

const UserItemVariants = cva(
  "flex items-center justify-start font-normal h-7 px-4 gap-1.5 text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edf9cc]",
        active: "text-[#481349] bg-white/90 hover:bg-white/90 ",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export default function UserItem({
  id,
  image,
  label = "Member",
  variant,
}: UserItemProps) {
  const workspaceId = useWorkspaceId();
  const avatarFallback = label.charAt(0).toUpperCase();

  return (
    <Button
      variant={"transparent"}
      size="sm"
      asChild
      className={cn(UserItemVariants({ variant }))}
    >
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <Avatar className="size-5 rounded-md mr-1">
          <AvatarImage className="rounded-md" src={image} />
          <AvatarFallback className="rounded-md bg-sky-500 text-white">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm truncate">{label}</span>
      </Link>
    </Button>
  );
}
