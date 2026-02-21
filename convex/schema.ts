import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

    // users on the system
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        image: v.optional(v.string()),
        lastSeen: v.optional(v.number()),
    }).index("by_clerkId", ["clerkId"]),

    // chat mapping 1-1 user
    conversations: defineTable({
        user1: v.id("users"),
        user2: v.id("users"),
    })
        .index("by_user1", ["user1"])
        .index("by_user2", ["user2"]),

    // messages schema
    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        createdAt: v.number(),
    })
        .index("by_conversation", ["conversationId"])
        .index("by_conversation_createdAt", ["conversationId", "createdAt"]),

    // typing table
    typing: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastTypedAt: v.number(),
    })
        .index("by_conversation", ["conversationId"])
        .index("by_conversation_user", ["conversationId", "userId"]),


    // reads 
    conversationReads: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastReadAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_conversation_user", ["conversationId", "userId"]),
});