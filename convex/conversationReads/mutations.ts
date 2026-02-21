import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {

        const latestMessage = await ctx.db
            .query("messages")
            .withIndex("by_conversation_createdAt", q =>
                q.eq("conversationId", args.conversationId)
            )
            .order("desc")
            .first();

        const latestTimestamp = latestMessage
            ? latestMessage.createdAt
            : Date.now();

        const existing = await ctx.db
            .query("conversationReads")
            .withIndex("by_conversation_user", q =>
                q.eq("conversationId", args.conversationId)
                    .eq("userId", args.userId)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                lastReadAt: latestTimestamp,
            });
        } else {
            await ctx.db.insert("conversationReads", {
                ...args,
                lastReadAt: latestTimestamp,
            });
        }
    },
});