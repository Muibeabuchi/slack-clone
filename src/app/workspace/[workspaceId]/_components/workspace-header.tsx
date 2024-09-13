"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { ChevronDownIcon, ListFilterIcon, SquarePenIcon } from "lucide-react";
import Hint from "@/components/hint";
import PreferenceModal from "./preferences-modal";
import { useState } from "react";

interface WorkspaceHeaderProps {
  workspace: Doc<"workspaces">;
  isAdmin: boolean;
}

export default function WorkspaceHeader({
  workspace,
  isAdmin,
}: WorkspaceHeaderProps) {
  const [openPrefrenceModal, setOpenPrefrenceModal] = useState(false);
  return (
    <>
      <PreferenceModal
        open={openPrefrenceModal}
        setOpen={setOpenPrefrenceModal}
        initialValue={workspace.name}
      />
      <div className="flex justify-between items-center px-4 h-[49px] gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"transparent"}
              className="font-semibold text-lg overflow-hidden w-auto p-1.5"
              size={"sm"}
            >
              <span className="truncate">{workspace.name}</span>
              <ChevronDownIcon className="size-4 ml-1 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" side="bottom" align="start">
            <DropdownMenuItem className="cursor-pointer capitalize">
              <div className="size-9 text-white font-semibold text-xl rounded-md flex items-center justify-center mr-2 relative overflow-hidden bg-[#616061]">
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <p className="font-bold">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">
                  Active Workspace
                </p>
              </div>
            </DropdownMenuItem>
            {isAdmin ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-2"
                  onClick={() => {}}
                >
                  Invite People to {workspace.name}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-2"
                  onClick={() => setOpenPrefrenceModal(true)}
                >
                  Preferences
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-0.5">
          <Hint label="New message" side="bottom">
            <Button variant={"transparent"} size={"iconSm"}>
              <SquarePenIcon className="size-4" />
            </Button>
          </Hint>
          <Hint label="Filter conversations" side="bottom">
            <Button variant={"transparent"} size={"iconSm"}>
              <ListFilterIcon className="size-4" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
}
