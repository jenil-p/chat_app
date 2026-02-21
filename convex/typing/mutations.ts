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

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastTypedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("typing", {
        ...args,
        lastTypedAt: Date.now(),
      });
    }
  },
});