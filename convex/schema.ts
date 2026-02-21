import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),
  conversations: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
  })
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"]),
});