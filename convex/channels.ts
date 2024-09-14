import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: { workspaceId: v.id("workspaces") },
  async handler(ctx, { workspaceId }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    // check if the user is a member of the workspace and is allowed to get the channels
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) return [];

    return await ctx.db
      .query("channels")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

export const create = mutation({
  args: { channelName: v.string(), workspaceId: v.id("workspaces") },
  async handler(ctx, { channelName, workspaceId }) {
    // check if the user is authenticated
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthorized");

    // check if the user is an admin of the workspace
    const isMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (!isMember || isMember.role === "member")
      throw new ConvexError("Unauthorized");

    // ?check if the workspace name is a duplicate

    // parse the value to name to strip backspaces and repplace with dashes
    const parsedChannelName = channelName.replace(/\s+/g, "-");
    // insert new channel into the workspace

    return await ctx.db.insert("channels", {
      chanelName: parsedChannelName,
      workspaceId,
    });
  },
});
