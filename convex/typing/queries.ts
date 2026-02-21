import { query } from "../_generated/server";
import { v } from "convex/values";

export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("typing")
      .withIndex("by_conversation", q =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});