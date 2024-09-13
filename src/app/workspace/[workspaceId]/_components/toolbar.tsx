"use client";

import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import { Info, Search } from "lucide-react";

interface ToolbarProps {
  workspaceName: string;
}

const Toolbar = ({ workspaceName }: ToolbarProps) => {
  // const workspaceId = useWorkspaceId();
  // const { data } = useGetWorkspace(workspaceId);
  return (
    <nav className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1" />
      <div className="min-w-[280px] max-w-[642px] grow-[2] shrink">
        <Button
          className="bg-accent/25 hover:bg-accent/25 w-full justify-start h-7 px-2"
          size="sm"
        >
          <Search className="size-4 text-white mr-2" />
          <span className="text-white text-xs">Search {workspaceName}</span>
        </Button>
      </div>
      <div className="ml-auto flex-1 flex items-center justify-end">
        <Button variant="transparent" size="iconSm">
          <Info className="size-5 text-white" />
        </Button>
      </div>
    </nav>
  );
};

export default Toolbar;
