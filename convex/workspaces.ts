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
    return workspaceId;
  },
});

export const get = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("workspaces").collect();
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
