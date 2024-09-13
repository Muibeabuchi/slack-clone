import { preloadQuery } from "convex/nextjs";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export async function preloadWorkspace(workspaceId: Id<"workspaces">) {
  return preloadQuery(
    api.workspaces.getById,
    {
      workspaceId,
    },
    { token: convexAuthNextjsToken() }
  );
}
