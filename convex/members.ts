import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
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

export const update = mutation({
  args: { memberId: v.id("members"), workspaceId: v.id("workspaces") },
  async handler(ctx, args) {
    // check if the user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    // // populate the user
    // const user = await populateUser(ctx, userId);

    // does this member exist?
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new ConvexError("Member does not exist");

    // check if the member is a part of the workspace
    const workspaceMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!workspaceMember) throw new ConvexError("Unauthorized");

    // is user a member of workspace?
    // check if the user is an admin
    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      )
      .unique();

    if (!currentMember || currentMember.role !== "admin")
      throw new ConvexError("Unauthorized");

    await ctx.db.patch(workspaceMember._id, {
      role: workspaceMember.role === "member" ? "admin" : "member",
    });

    return workspaceMember._id;
  },
});
