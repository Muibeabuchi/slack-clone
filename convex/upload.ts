import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});
