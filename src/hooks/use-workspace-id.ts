import { useParams } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";

export function useWorkspaceId() {
  return useParams().workspaceId as Id<"workspaces">;
}
