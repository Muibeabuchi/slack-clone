"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { usePanel } from "@/hooks/use-panel";
import { Loader } from "lucide-react";
import { ReactNode } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Threads } from "@/features/messages/components/Threads";

interface ResizeablePanelProps {
  children: ReactNode;
  defaultLayout: number[] | undefined;
  workspaceSidebar: ReactNode;
}

export default function ResizeableSidebar({
  children,
  defaultLayout = [20, 80],
  workspaceSidebar,
}: ResizeablePanelProps) {
  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };
  const { parentMessageId, onClose } = usePanel();
  const showPanel = !!parentMessageId;

  return (
    <ResizablePanelGroup
      autoSaveId={"chiki-workspace-layout"}
      onLayout={onLayout}
      direction="horizontal"
    >
      <ResizablePanel
        defaultSize={defaultLayout?.[0]}
        minSize={11}
        className="bg-[#5e2c5f]"
      >
        {workspaceSidebar}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={20} defaultSize={defaultLayout?.[1]}>
        {children}
      </ResizablePanel>

      {showPanel ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={29}
            minSize={20}
            // className="bg-[#5e2c5f]"
          >
            {parentMessageId ? (
              <Threads
                messageId={parentMessageId as Id<"messages">}
                onClose={onClose}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <Loader className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {/* fetch data for the thread */}
            {/* display the data with already built components */}
          </ResizablePanel>
        </>
      ) : null}
    </ResizablePanelGroup>
  );
}
