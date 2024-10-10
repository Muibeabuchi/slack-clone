import { ConvexError, v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => ctx.db.get(userId);

const populateReaction = (ctx: QueryCtx, messageId: Id<"messages">) =>
  ctx.db
    .query("reactions")
    .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
    .collect();

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_parent_message_id", (q) =>
      q.eq("parentMessageId", messageId)
    )
    .collect();

  if (messages.length === 0) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

  if (!lastMessageMember) {
    return {
      count: 0,
      image: undefined,
      timestamp: 0,
      name: "",
    };
  }

  const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

  return {
    count: messages.length,
    image: lastMessageUser?.image,
    timestamp: lastMessage._creationTime,
    name: lastMessageUser?.name,
  };
};
const populateMember = (ctx: QueryCtx, memberId: Id<"members">) =>
  ctx.db.get(memberId);

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

export const update = mutation({
  args: {
    messageId: v.id("messages"),
    body: v.string(),
  },
  async handler(ctx, args) {
    // check if the user is authenticated

    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthorized");

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || member._id !== message.memberId)
      throw new ConvexError("Unauthorized");

    await ctx.db.patch(args.messageId, {
      body: args.body,
      updatedAt: Date.now(),
    });
    return args.messageId;
  },
});
export const remove = mutation({
  args: {
    messageId: v.id("messages"),
  },
  async handler(ctx, args) {
    // check if the user is authenticated

    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthorized");

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError("Message not found");
    }

    const member = await getMember(ctx, message.workspaceId, userId);
    if (!member || member._id !== message.memberId)
      throw new ConvexError("Unauthorized");

    await ctx.db.delete(args.messageId);
    return args.messageId;
  },
});

export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Unauthorized");
    // if (!userId) return null;

    let _conversationId = args.conversationId;

    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) throw new ConvexError("Parent message not found");

      _conversationId = parentMessage?.conversationId;
    }

    const results = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", _conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId);
            const user = member ? await populateUser(ctx, member.userId) : null;

            if (!member || !user) {
              return null;
            }

            const reactions = await populateReaction(ctx, message._id);
            const threads = await populateThread(ctx, message._id);
            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;
            const reactionsWithCount = reactions.map((reaction) => {
              return {
                ...reaction,
                count: reactions.filter((r) => {
                  return r.value === reaction.value;
                }).length,
              };
            });

            // deduplicate the reactions
            const dedupedReactions = reactionsWithCount.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value
                );
                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId])
                  );
                } else {
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }
                return acc;
              },
              [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
              })[]
            );
            const reactionWithoutMemberIdProperty = dedupedReactions.map(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              ({ memberId, ...rest }) => rest
            );

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionWithoutMemberIdProperty,
              threadCount: threads.count,
              threadImage: threads.image,
              threadTimestamp: threads.timestamp,
              threadName: threads.name,
            };
          })
        )
      ).filter((message) => message !== null),
    };
  },
});

export const getById = query({
  args: { messageId: v.id("messages") },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const message = await ctx.db.get(args.messageId);
    if (!message) return null;

    // ? Only members should load a message
    const currentMember = await getMember(ctx, message.workspaceId, userId);
    if (!currentMember) return null;

    const member = await populateMember(ctx, message.memberId);
    if (!member) return null;
    const user = await populateUser(ctx, member.userId);
    if (!user) return null;
    const reactions = await populateReaction(ctx, message._id);

    const reactionsWithCount = reactions.map((reaction) => {
      return {
        ...reaction,
        count: reactions.filter((r) => {
          return r.value === reaction.value;
        }).length,
      };
    });

    // deduplicate the reactions
    const dedupedReactions = reactionsWithCount.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);
        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId])
          );
        } else {
          acc.push({ ...reaction, memberIds: [reaction.memberId] });
        }
        return acc;
      },
      [] as (Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      })[]
    );

    const reactionWithoutMemberIdProperty = dedupedReactions.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ memberId, ...rest }) => rest
    );

    return {
      ...message,
      image: message.image
        ? await ctx.storage.getUrl(message.image)
        : undefined,
      user,
      member,
      reactions: reactionWithoutMemberIdProperty,
    };
  },
});

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
      conversationId: _conversationId,
    });
  },
});
