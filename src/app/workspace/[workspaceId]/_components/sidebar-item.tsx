import { IconType } from "react-icons/lib";
// import { Id } from "../../../../../convex/_generated/dataModel";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Id } from "../../../../../convex/_generated/dataModel";

const sidebarItemVariants = cva(
  "flex items-center justify-start font-normal h-7 px-[18px] gap-1.5 text-sm overflow-hidden",
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

interface SidebarItemProps {
  label?: string;
  id?: Id<"workspaces"> | string;
  icon: IconType | LucideIcon;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
}

export const SidebarItem = ({
  icon: Icon,
  id,
  label,
  variant,
}: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();
  return (
    <Button
      asChild
      variant="transparent"
      size={"sm"}
      className={cn(sidebarItemVariants({ variant }))}
    >
      <Link href={`/workspace/${workspaceId}/channel/${id}`}>
        <Icon className="size-3.5 mr-1 shrink-0 " />
        <span className="text-sm truncate">{label}</span>
      </Link>
    </Button>
  );
};
