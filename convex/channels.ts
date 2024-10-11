import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getById = query({
  args: { channelId: v.id("channels") },
  async handler(ctx, { channelId }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const channel = await ctx.db.get(channelId);
    if (!channel) return null;

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member) return null;

    return channel;
  },
});

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

export const edit = mutation({
  args: {
    channelName: v.string(),
    workspaceId: v.id("workspaces"),
    channelId: v.id("channels"),
  },
  async handler(ctx, { channelName, workspaceId, channelId }) {
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

    // parse the value to name to strip backspaces and repplace with dashes
    const parsedChannelName = channelName.replace(/\s+/g, "-");

    // check if the channel exits
    const channel = await ctx.db.get(channelId);
    if (!channel) throw new ConvexError("The channel does not exist!");

    // ?check if the workspace name is a duplicate
    const isDuplicate = parsedChannelName === channel.chanelName;
    if (isDuplicate) throw new ConvexError("Same Channel Name");

    // patch new channelName into the workspace
    await ctx.db.patch(channelId, {
      chanelName: parsedChannelName,
    });
    return channel;
  },
});

export const remove = mutation({
  args: {
    // channelName: v.string(),
    // workspaceId: v.id("workspaces"),
    channelId: v.id("channels"),
  },
  async handler(ctx, { channelId }) {
    // check if the user is authenticated
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthorized");

    // check if the channel exits
    const channel = await ctx.db.get(channelId);
    if (!channel) throw new ConvexError("The channel does not exist!");

    // check if the user is an admin of the workspace
    const isMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", channel.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!isMember || isMember.role === "member")
      throw new ConvexError("Unauthorized");

    const [messages] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // delete new channelName into the workspace
    await ctx.db.delete(channelId);
    return channel;
  },
});
