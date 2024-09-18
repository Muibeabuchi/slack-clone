import {
  defineSchema,
  defineTable,
  // defineTable
} from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";
// import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  workspaces: defineTable({
    name: v.string(),
    userId: v.id("users"),
    joincode: v.string(),
  }).index("by_user_id", ["userId"]),
  members: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("by_user_id", ["userId"])
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_id_user_id", ["workspaceId", "userId"]),
  channels: defineTable({
    chanelName: v.string(),
    workspaceId: v.id("workspaces"),
  }).index("by_workspaceId", ["workspaceId"]),
  messages: defineTable({
    body: v.string(),
    image: v.optional(v.id("_storage")),
    memberId: v.id("members"),
    workspaceId: v.id("workspaces"),
    //? Messages can be 1v1 or in a channel.....
    channelId: v.optional(v.id("channels")),
    parentMessageId: v.optional(v.id("messages")),
    // TODO: Add conversation Id later
    updatedAt: v.number(),
  }),
});

export default schema;
