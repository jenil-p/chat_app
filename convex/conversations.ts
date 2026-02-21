import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// find existing conversation , if not exists make new one.
export const getOrCreateConversation = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // check if conversation already exits.
    const existing = await ctx.db
      .query("conversations")
      .filter(q =>
        q.or(
          q.and(
            q.eq(q.field("user1"), args.user1),
            q.eq(q.field("user2"), args.user2)
          ),
          q.and(
            q.eq(q.field("user1"), args.user2),
            q.eq(q.field("user2"), args.user1)
          )
        )
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", args);
  },
});