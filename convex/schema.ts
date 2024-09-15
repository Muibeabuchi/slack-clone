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
});

export default schema;
