import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createOrGet = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    memberId: v.id("members"),
  },
  async handler(ctx, { workspaceId, memberId }) {
    // check if the user is authenticated

    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthorized");

    const currentMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    const otherMember = await ctx.db.get(memberId);

    if (!currentMember || !otherMember)
      throw new ConvexError("Member not found");

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("workspaceId"), workspaceId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("memberOneId"), currentMember._id),
            q.eq(q.field("memberTwoId"), otherMember._id)
          ),
          q.and(
            q.eq(q.field("memberOneId"), otherMember._id),
            q.eq(q.field("memberTwoId"), currentMember._id)
          )
        )
      )
      .unique();

    if (existingConversation) {
      return existingConversation;
    }

    const conversationId = await ctx.db.insert("conversations", {
      workspaceId,
      memberOneId: currentMember._id,
      memberTwoId: otherMember._id,
    });

    const conversation = await ctx.db.get(conversationId);
    if (!conversation) throw new ConvexError("Conversation does not exist");

    return conversation;
  },
});
