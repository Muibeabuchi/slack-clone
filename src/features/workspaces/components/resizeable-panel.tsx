"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ReactNode } from "react";

interface ResizeablePanelProps {
  children: ReactNode;
  defaultLayout: number[] | undefined;
}

export default function ResizeableSidebar({
  children,
  defaultLayout = [20, 80],
}: ResizeablePanelProps) {
  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };
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
        <div>Channels Sidebar</div>
      </ResizablePanel>
      <ResizableHandle className="bg-red-700 w-2 " withHandle />
      <ResizablePanel minSize={20} defaultSize={defaultLayout?.[1]}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
