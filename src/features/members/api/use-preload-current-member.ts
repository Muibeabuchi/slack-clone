import { preloadQuery } from "convex/nextjs";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export async function preloadCurrentMember(workspaceId: Id<"workspaces">) {
  return preloadQuery(
    api.members.current,
    {
      workspaceId,
    },
    { token: convexAuthNextjsToken() }
  );
}
