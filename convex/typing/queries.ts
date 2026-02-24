import { query } from "../_generated/server";
import { v } from "convex/values";

export const getTypingUsers = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const TYPING_TIMEOUT_MS = 5000;
    const cutoff = Date.now() - TYPING_TIMEOUT_MS;

    const all = await ctx.db
      .query("typing")
      .withIndex("by_conversation", q =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    return all.filter(t => t.lastTypedAt > cutoff);
  },
});