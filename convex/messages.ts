import { ConvexError, v } from "convex/values";
import { mutation, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

async function getMember(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">
) {
  return ctx.db
    .query("members")
    .withIndex("by_workspace_id_user_id", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId)
    )
    .unique();
}

export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    parentMessageId: v.optional(v.id("messages")),
    conversationId: v.optional(v.id("conversations")),
  },
  async handler(
    ctx,
    { body, image, workspaceId, channelId, parentMessageId, conversationId }
  ) {
    // check for a valid user
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthorized");

    const member = await getMember(ctx, workspaceId, userId);

    if (!member) throw new ConvexError("Unauthorized");

    let _conversationId = conversationId;
    // only possible if in a 1:1 conversation
    if (!conversationId && !channelId && parentMessageId) {
      const parentMessage = await ctx.db.get(parentMessageId);
      if (!parentMessage) throw new ConvexError("Parent message not found");
      _conversationId = parentMessage.conversationId;
    }

    return await ctx.db.insert("messages", {
      body,
      memberId: member._id,
      workspaceId,
      channelId,
      image,
      parentMessageId,
      updatedAt: Date.now(),
      conversationId: _conversationId,
    });
  },
});
