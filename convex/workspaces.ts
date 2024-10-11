import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const generateCode = () => {
  return Array.from({ length: 6 }, () => {
    return "0123456789abcdefghijklmnopqrstuvwxyz"[
      Math.ceil(Math.random() * 36)
    ];
  }).join("");
};

export const create = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, { name }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Unauthenticated");
    }
    // todo: Create a proper method later
    const joincode = generateCode();

    const workspaceId = await ctx.db.insert("workspaces", {
      joincode,
      name,
      userId,
    });

    await ctx.db.insert("channels", {
      chanelName: "General",
      workspaceId,
    });

    await ctx.db.insert("members", {
      role: "admin",
      userId,
      workspaceId,
    });

    return workspaceId;
  },
});

export const get = query({
  args: {},
  async handler(ctx) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    // find out where a user is a member in
    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    if (!members) {
      return null;
    }
    const workspaceIds = members.map((member) => member.workspaceId);

    const userWorkspaces = await Promise.all(
      workspaceIds.map(async (id) => {
        return await ctx.db.get(id);
      })
    );

    return userWorkspaces;
  },
});

export const getById = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  async handler(ctx, { workspaceId }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const isMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (isMember === null) {
      return null;
    }
    return await ctx.db.get(workspaceId);
  },
});

export const update = mutation({
  args: { workspaceId: v.id("workspaces"), newWorkspaceName: v.string() },
  async handler(ctx, { workspaceId, newWorkspaceName }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role === "member") {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(workspaceId, {
      name: newWorkspaceName,
    });

    return workspaceId;

    // check if the user is permitted to update this workspace
    // if they are the admin then the action is permissible

    // check if the user is the creator of the workspace
  },
});

export const remove = mutation({
  args: { workspaceId: v.id("workspaces") },
  async handler(ctx, { workspaceId }) {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthenticated");

    // check if the user is a member of the workspace
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role === "member") {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.delete(workspaceId);

    // query all associated members in this workspace
    const workspaceMembers = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    // query for all channels in the workspace
    const workspaceChannels = await ctx.db
      .query("channels")
      .withIndex("by_workspaceId", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    // query for all conversations in the workspace
    const workspaceConversations = await ctx.db
      .query("conversations")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    // query for all messages in the workspace
    const workspaceMessages = await ctx.db
      .query("messages")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    // query for all messages in the workspace
    const workspaceReactions = await ctx.db
      .query("reactions")
      .withIndex("by_workspace_id", (q) => q.eq("workspaceId", workspaceId))
      .collect();

    // delete all associated members in this workspace
    // delete all associated channels in the workspace
    // delete all associated conversations in the workspace
    // delete all associated messages in the workspace
    await Promise.all([
      workspaceMembers.map(async (member) => {
        await ctx.db.delete(member._id);
      }),
      workspaceChannels.map(async (channel) => {
        await ctx.db.delete(channel._id);
      }),
      workspaceConversations.map(async (conversation) => {
        await ctx.db.delete(conversation._id);
      }),
      workspaceMessages.map(async (messages) => {
        await ctx.db.delete(messages._id);
      }),
      workspaceReactions.map(async (reactions) => {
        await ctx.db.delete(reactions._id);
      }),
    ]);

    return workspaceId;
  },
});

export const newJoinCode = mutation({
  args: { workspaceId: v.id("workspaces") },
  async handler(ctx, { workspaceId }) {
    // check if the user is authenticated
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthenticated");

    // check if the user is a member and admin of the workspace
    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (!member || member.role === "member") {
      throw new ConvexError("Unauthorized");
    }

    // ?should probably check if the previous code is equals to the new generated code
    const workspace = await ctx.db.get(workspaceId);
    if (!workspace) throw new ConvexError("Workspace does not exist");
    const checkNewCode = () => {
      //create a new joincode
      const newCode = generateCode();
      if (workspace.joincode !== newCode) return newCode;
      return checkNewCode();
    };

    const joincode = checkNewCode();

    // patch the current joincode field of the workspace
    await ctx.db.patch(workspaceId, {
      joincode,
    });
    return joincode;
  },
});

export const join = mutation({
  args: { joinCode: v.string(), workspaceId: v.id("workspaces") },
  async handler(ctx, { joinCode, workspaceId }) {
    // check if the user is authenticated
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthenticated");

    // checki f the workspace exists
    const workspace = await ctx.db.get(workspaceId);
    if (!workspace) throw new ConvexError("This workspace does not exist");

    if (workspace.joincode !== joinCode.toLowerCase())
      throw new ConvexError("Invalid join code");

    // check if the user is an existing member ----pretty nice edge case
    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    if (existingMember) {
      throw new ConvexError("Already a member of this workspace");
    }

    // add the user as a member to the workspace
    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "member",
    });

    return {
      workspaceId,
    };
  },
});

export const getWorkspaceInfo = query({
  args: { workspaceId: v.id("workspaces") },
  async handler(ctx, { workspaceId }) {
    // check if the user is authenticated
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Unauthenticated");

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", workspaceId).eq("userId", userId)
      )
      .unique();

    const workspace = await ctx.db.get(workspaceId);

    return {
      workspaceName: workspace?.name,
      isMember: !!member,
    };
  },
});
