"use client";

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
      <CreateWorkSpaceModal />
    </>
  );
};
