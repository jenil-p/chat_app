"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatTimestamp } from "@/lib/formatTimestamp";

interface SidebarProps {
    currentUser: any;
    selectedConversation: Id<"conversations"> | null;
    setSelectedConversation: (id: Id<"conversations"> | null) => void;
}

export default function Sidebar({ currentUser, selectedConversation, setSelectedConversation }: SidebarProps) {
    const [search, setSearch] = useState("");
    const [now, setNow] = useState(Date.now());

    const allUsers = useQuery(api.users.queries.getUsersExceptMe, { clerkId: currentUser.clerkId });
    const conversations = useQuery(api.conversations.queries.getUserConversations, { userId: currentUser._id });
    const createConversation = useMutation(api.conversations.mutations.getOrCreateConversation);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const filteredUsers = allUsers?.filter(u => u.name.toLowerCase().includes(search.toLowerCase())) || [];

    if (!conversations) return <div className="p-4">Loading chats...</div>;

    return (
        <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <UserButton afterSignOutUrl="/sign-in" appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
                <h1 className="text-xl font-bold text-gray-800">Chats</h1>
            </div>

            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users to chat..."
                        className="w-full bg-gray-100 text-gray-800 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {search ? (
                    <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Search Results</div>
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No users found</div>
                        ) : (
                            filteredUsers.map(u => (
                                <div
                                    key={u._id}
                                    onClick={async () => {
                                        const convoId = await createConversation({ user1: currentUser._id, user2: u._id });
                                        setSelectedConversation(convoId);
                                        setSearch("");
                                    }}
                                    className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition"
                                >
                                    <img src={u.image} alt={u.name} className="w-12 h-12 rounded-full object-cover" />
                                    <span className="font-medium text-gray-800">{u.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div>
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                <span className="text-4xl">👋</span>
                                <p>No conversations yet. Search above to start chatting!</p>
                            </div>
                        ) : (
                            conversations.map(c => {
                                const isOnline = c.otherUser?.lastSeen && now - c.otherUser.lastSeen < 20000;
                                return (
                                    <div
                                        key={c.conversationId}
                                        onClick={() => setSelectedConversation(c.conversationId)}
                                        className={`flex items-center gap-3 p-4 cursor-pointer transition ${selectedConversation === c.conversationId ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="relative">
                                            <img src={c.otherUser?.image} alt={c.otherUser?.name} className="w-12 h-12 rounded-full object-cover" />
                                            {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className="font-semibold text-gray-900 truncate">{c.otherUser?.name}</h3>
                                                {c.lastMessage && (
                                                    <span className="text-xs text-gray-500 shrink-0">
                                                        {formatTimestamp(c.lastMessage.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${c.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                                {c.lastMessage ? c.lastMessage.content : "Start a conversation"}
                                            </p>
                                        </div>
                                        {c.unreadCount > 0 && (
                                            <div className="bg-blue-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                                                {c.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}