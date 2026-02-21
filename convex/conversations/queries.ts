import { query } from "../_generated/server";
import { v } from "convex/values";

// find all chats for this user
export const getUserConversations = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const conversations = await ctx.db
            .query("conversations")
            .filter(q =>
                q.or(
                    q.eq(q.field("user1"), args.userId),
                    q.eq(q.field("user2"), args.userId)
                )
            )
            .collect();

        const results = [];

        for (const convo of conversations) {
            const otherUserId =
                convo.user1 === args.userId ? convo.user2 : convo.user1;

            const otherUser = await ctx.db.get(otherUserId);

            const lastMessage = await ctx.db
                .query("messages")
                .withIndex("by_conversation_createdAt", q =>
                    q.eq("conversationId", convo._id)
                )
                .order("desc")
                .first();

            results.push({
                conversationId: convo._id,
                otherUser,
                lastMessage,
            });
        }

        return results;
    },
});