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
  args: {
    memberId: v.id("members"),
    workspaceId: v.id("workspaces"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  async handler(ctx, args) {
    // check if the user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    // does this member exist?
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new ConvexError("Member does not exist");

    // check if the member is a part of the workspace
    const workspaceMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", member.workspaceId).eq("userId", member.userId)
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
      role: args.role,
    });

    return workspaceMember;
  },
});

export const remove = mutation({
  args: { memberId: v.id("members"), workspaceId: v.id("workspaces") },
  async handler(ctx, args) {
    // check if the user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");

    // does this member exist?
    const member = await ctx.db.get(args.memberId);
    if (!member) throw new ConvexError("Member does not exist");

    // check if the member is a part of the workspace

    const workspaceMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", member.userId)
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

    if (!currentMember) throw new ConvexError("Unauthorized");

    // ensure admins cannot be removed
    if (workspaceMember.role === "admin")
      throw new ConvexError("Admin cannot be removed");

    // ensure member cannot delete themselves
    const isSelf = workspaceMember._id === currentMember._id;
    if (isSelf && currentMember.role !== "member")
      throw new ConvexError("Cannot remove self if is an admin");

    // clean up all the messages,conversations and reactions this member has made in the workspace

    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", workspaceMember._id))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", workspaceMember._id))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) =>
          q.or(
            q.eq(q.field("memberOneId"), workspaceMember._id),
            q.eq(q.field("memberTwoId"), workspaceMember._id)
          )
        )
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    await ctx.db.delete(workspaceMember._id);

    return workspaceMember._id;
  },
});
