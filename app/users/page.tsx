"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function UsersPage() {
    const { user } = useUser();
    const [search, setSearch] = useState("");

    const users = useQuery(
        api.users.queries.getUsersExceptMe,
        user ? { clerkId: user.id } : "skip"
    );

    const currentUser = useQuery(
        api.users.queries.getCurrentUser,
        user ? { clerkId: user.id } : "skip"
    );

    const createConversation = useMutation(
        api.conversations.mutations.getOrCreateConversation
    );

    if (!users) return <div>Finding users...Or may be not found any if after sometim does not appear anyone here. it means no one is ready to talk to you. Go home Buddy!! </div>;

    if (!currentUser) return <div>Current user is loading or No current user...</div>;

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h2>All Users</h2>

            <input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {filtered.length === 0 && (
                <div style={{ padding: "20px", color: "gray" }}>
                    <h4>No users found 🔍</h4>
                    <p>Try searching with a different name.</p>
                </div>
            )}

            {filtered.map(u => (
                <div
                    key={u._id}
                    onClick={async () => {
                        const convoId = await createConversation({
                            user1: currentUser._id,
                            user2: u._id,
                        });
                        console.log("Conversation ID:", convoId);
                    }}
                    style={{ cursor: "pointer", margin: "10px 0" }}
                >
                    <img src={u.image} width={30} />
                    {u.name}
                </div>
            ))}
        </div>
    );
}