"use client";
import { useRouter } from "next/navigation";

import { useWorkSpaces } from "@/features/workspaces/api/use-get-work-spaces";
// import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import { useCreateWorkSpaceModal } from "@/features/workspaces/store/use-create-workspace-modal";

// import { useWorkspaceId } from "@/app/hooks/use-workspace-id";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  //  Loader,
} from "lucide-react";
import { Doc } from "../../../../../convex/_generated/dataModel";

interface WorkspaceSwitcherProps {
  workspace: Doc<"workspaces">;
}

export default function WorkspaceSwitcher({
  workspace,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  // const workspaceId = useWorkspaceId();
  const [, setOpen] = useCreateWorkSpaceModal();
  // const { data: workspace, isLoading: workspaceLoading } =
  //   useGetWorkspace(workspaceId);
  const {
    data: workspaces,
    //  isLoading: workspacesLoading
  } = useWorkSpaces();

  const filterWorkspaces = workspaces?.filter(
    (item) => item?._id !== workspace?._id
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="text-xl font-semi-bold overflow-hidden text-slate-800 relative bg-[#ABABAD] hover:bg-[#ABABAD]/80">
          <p>{workspace?.name.charAt(0).toUpperCase()}</p>
          {/* {workspaceLoading ? (
            <Loader className="size-5 animate-spin shrink-0" />
          ) : (
          )} */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="center">
        <DropdownMenuItem
          onClick={() => router.push(`/workspace/${workspace._id}`)}
          className="cursor-pointer truncate items-start capitalize flex-col justify-start"
        >
          {workspace?.name}
          <span className="text-xs  text-muted-foreground">
            Active Workspace
          </span>
        </DropdownMenuItem>
        {filterWorkspaces?.map((workspace) => {
          return (
            <DropdownMenuItem
              className="cursor-pointer capitalize"
              onClick={() => router.push(`/workspace/${workspace?._id}`)}
              key={workspace?._id}
            >
              <div className="relative size-9 overflow-hidden bg-[#616061] text-white font-semibold text-xl rounded-md  flex items-center justify-center mr-2 ">
                {workspace?.name.charAt(0).toUpperCase()}
              </div>
              <p className="truncate text-ellipsis">{workspace?.name}</p>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem
          onClick={() => setOpen(true)}
          className="cursor-pointer"
        >
          <div className="relative size-9 overflow-hidden bg-[#f2f2f2] font-semibold text-xl rounded-md  flex items-center justify-center mr-2 text-slate-800">
            <Plus className="size-5" />
          </div>
          Create a new workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
