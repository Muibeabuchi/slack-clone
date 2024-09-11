"use client";

import { useCreateWorkSpaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { Id } from "../../../convex/_generated/dataModel";

interface ClientRedirectProps {
  workspaceId: Id<"workspaces"> | undefined;
}

export default function ClientDedirect({ workspaceId }: ClientRedirectProps) {
  const [, setOpen] = useCreateWorkSpaceModal();

  if (!workspaceId) setOpen(true);

  return null;
}
