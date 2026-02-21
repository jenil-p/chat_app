import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// make the user in database
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) =>
        q.eq("clerkId", args.clerkId)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("users", args);
    }
  },
});

// get all the users 
export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// get all users excluding the current user (for search thing)
export const getUsersExceptMe = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", args.clerkId))
      .unique();

    if (!currentUser) return [];

    return await ctx.db
      .query("users")
      .filter(q => q.neq(q.field("_id"), currentUser._id))
      .collect();
  },
});


// get current user's convex id that is _id
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", args.clerkId))
      .unique();
  },
});