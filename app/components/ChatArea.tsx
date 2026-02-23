"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, ArrowLeft, ChevronDown } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import MessageBubble from "./MessageBubble";

interface ChatAreaProps {
    currentUser: any;
    selectedConversation: Id<"conversations"> | null;
    setSelectedConversation: (id: Id<"conversations"> | null) => void;
}

export default function ChatArea({ currentUser, selectedConversation, setSelectedConversation }: ChatAreaProps) {
    const [message, setMessage] = useState("");
    const [now, setNow] = useState(Date.now());
    const [showScrollButton, setShowScrollButton] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const messages = useQuery(api.messages.queries.getMessages, selectedConversation ? { conversationId: selectedConversation } : "skip");
    const typingUsers = useQuery(api.typing.queries.getTypingUsers, selectedConversation ? { conversationId: selectedConversation } : "skip");
    const conversations = useQuery(api.conversations.queries.getUserConversations, { userId: currentUser._id });

    const updateTyping = useMutation(api.typing.mutations.updateTyping);
    const sendMessage = useMutation(api.messages.mutations.sendMessage);
    const markAsRead = useMutation(api.conversationReads.mutations.markAsRead);

    const activeChatData = conversations?.find(c => c.conversationId === selectedConversation);
    const activeTypers = typingUsers?.filter(t => t.userId !== currentUser?._id && now - t.lastTypedAt < 2000) || [];

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const isUserNearBottom = () => {
        const container = messagesContainerRef.current;
        if (!container) return true;
        return container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    };

    useEffect(() => {
        if (!messages || !selectedConversation) return;
        if (isUserNearBottom()) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowScrollButton(false);
            markAsRead({ conversationId: selectedConversation, userId: currentUser._id });
        } else {
            setShowScrollButton(true);
        }
    }, [messages?.length, selectedConversation, currentUser._id, markAsRead]);

    const handleScroll = () => {
        if (isUserNearBottom() && selectedConversation) {
            setShowScrollButton(false);
            markAsRead({ conversationId: selectedConversation, userId: currentUser._id });
        } else {
            setShowScrollButton(true);
        }
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim() || !selectedConversation) return;

        sendMessage({
            conversationId: selectedConversation,
            senderId: currentUser._id,
            content: message.trim(),
        });

        updateTyping({ conversationId: selectedConversation, userId: currentUser._id, stop: true });
        setMessage("");
    };

    if (!selectedConversation) {
        return (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-medium text-gray-600">Select a conversation</h2>
                <p>Or search for a user to start a new chat</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#efeae2] relative">
            {/* name and profile pic */}
            <div className="bg-white px-4 py-3 flex items-center gap-4 border-b border-gray-200 sticky top-0 z-10">
                <button onClick={() => setSelectedConversation(null)} className="md:hidden text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <img src={activeChatData?.otherUser?.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                    <h2 className="font-semibold text-gray-800">{activeChatData?.otherUser?.name}</h2>
                    <p className="text-xs text-gray-500">
                        {(activeChatData?.otherUser?.lastSeen && now - activeChatData.otherUser.lastSeen < 20000) ? "Online" : "Offline"}
                    </p>
                </div>
            </div>

            {/* messages (from each side) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesContainerRef} onScroll={handleScroll}>
                {messages?.length === 0 && (
                    <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg text-center max-w-sm mx-auto text-sm mt-10">
                        No messages here yet. Send a message to start!
                    </div>
                )}

                {messages?.map((m) => (
                    <MessageBubble key={m._id} message={m} currentUser={currentUser} />
                ))}

                {activeTypers.length > 0 && (
                    <div className="flex items-start">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* scroll to down */}
            {showScrollButton && (
                <button
                    onClick={() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                        setShowScrollButton(false);
                    }}
                    className="absolute bottom-20 right-6 bg-white border border-gray-200 shadow-lg text-gray-700 p-2 rounded-full hover:bg-gray-50 z-20"
                >
                    <ChevronDown className="w-5 h-5" />
                </button>
            )}

            {/* input of the message  */}
            <form onSubmit={handleSendMessage} className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Type a message"
                    className="flex-1 bg-white rounded-full py-3 px-5 focus:outline-none shadow-sm"
                    value={message}
                    onChange={e => {
                        setMessage(e.target.value);
                        updateTyping({ conversationId: selectedConversation, userId: currentUser._id });
                    }}
                />
                <button type="submit" disabled={!message.trim()} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 transition">
                    <Send className="w-5 h-5 ml-1" />
                </button>
            </form>
        </div>
    );
}