import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const populateUser = (ctx: QueryCtx, id: Id<"users">) => ctx.db.get(id);

export const getById = query({
  args: { memberId: v.id("members") },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const member = await ctx.db.get(args.memberId);
    if (!member) return null;

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember) return null;

    const user = await populateUser(ctx, member.userId);
    if (!user) return null;

    return {
      ...member,
      user,
    };
  },
});

export const current = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .first();

    if (!member) return null;
    return member;
  },
});

export const workspaceMembers = query({
  args: { workspaceId: v.id("workspaces") },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const isMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!isMember) return [];

    const members = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    const membersUserIds = members.map(async (item) => {
      const response = await ctx.db.get(item.userId);
      return {
        ...item,
        userData: response,
      };
    });

    return await Promise.all(membersUserIds);
  },
});
