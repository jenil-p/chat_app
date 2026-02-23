import { mutation } from "../_generated/server";
import { v } from "convex/values";


export const updateTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .withIndex("by_conversation_user", q =>
        q.eq("conversationId", args.conversationId)
          .eq("userId", args.userId)
      )
      .unique();

    let timeToSet = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastTypedAt: timeToSet,
      });
    } else {
      await ctx.db.insert("typing", {
        conversationId: args.conversationId,
        userId: args.userId,
        lastTypedAt: timeToSet,
      });
    }
  },
});