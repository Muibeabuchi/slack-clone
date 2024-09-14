"use client";

import CreateChannelModal from "@/features/channels/components/create-channel-modal";
import { CreateWorkSpaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { useEffect, useState } from "react";

// export { CreateWorkSpaceModal }

export const Modals = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (!isClient) {
      setIsClient(true);
    }
  }, [isClient]);

  if (!isClient) return null;
  return (
    <>
      <CreateChannelModal />
      <CreateWorkSpaceModal />
    </>
  );
};
