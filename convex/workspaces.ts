import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, { name }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthorized");
    }
    // todo: Create a proper method later
    const joincode = "12345";

    const workspaceId = await ctx.db.insert("workspaces", {
      joincode,
      name,
      userId,
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
    if (userId === null) throw new ConvexError("Unauthorized");

    // find out where a user is a member in
    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    if (!members) {
      throw new ConvexError("User has no memberships");
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
    if (userId === null) throw new ConvexError("Unauthorized");

    return await ctx.db.get(workspaceId);
  },
});
