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
  }),
});

export default schema;
