import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const generateCode = () => {
  return Array.from({ length: 6 }, () => {
    return "0123456789abcdefghijklmnopqrstuvwxyz"[
      Math.ceil(Math.random() * 36)
    ];
  }).join("");
};

export const create = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, { name }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthenticated");
    }
    // todo: Create a proper method later
    const joincode = generateCode();

    const workspaceId = await ctx.db.insert("workspaces", {
      joincode,
      name,
      userId,
    });

    await ctx.db.insert("channels", {
      chanelName: "General",
      workspaceId,
    });

    await ctx.db.insert("members", {
      role: "admin",
      userId,
      workspaceId,
    });

    return workspaceId;
  },
});

export const get = query({
  args: {},
  async handler(ctx) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    // find out where a user is a member in
    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    if (!members) {
      return null;
    }
    const workspaceIds = members.map((member) => member.workspaceId);

    const userWorkspaces = await Promise.all(
      workspaceIds.map(async (id) => {
        return await ctx.db.get(id);
      })
    );

    return userWorkspaces;
  },
});

export const getById = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  async handler(ctx, { workspaceId }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const isMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (isMember === null) {
      return null;
    }
    return await ctx.db.get(workspaceId);
  },
});

export const update = mutation({
  args: { workspaceId: v.id("workspaces"), newWorkspaceName: v.string() },
  async handler(ctx, { workspaceId, newWorkspaceName }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role === "member") {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(workspaceId, {
      name: newWorkspaceName,
    });

    return workspaceId;

    // check if the user is permitted to update this workspace
    // if they are the admin then the action is permissible

    // check if the user is the creator of the workspace
  },
});

export const remove = mutation({
  args: { workspaceId: v.id("workspaces") },
  async handler(ctx, { workspaceId }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthenticated");

    // check if the user is a member of the workspace
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role === "member") {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(workspaceId);

    // query all associated members in this workspace
    const workspaceMembers = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    // delete all associated members in this workspace
    await Promise.all(
      workspaceMembers.map(async (member) => {
        await ctx.db.delete(member._id);
      })
    );

    return workspaceId;
  },
});
