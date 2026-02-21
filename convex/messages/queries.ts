import { query } from "../_generated/server";
import { v } from "convex/values";

// get message instanly
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation_createdAt", q =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});