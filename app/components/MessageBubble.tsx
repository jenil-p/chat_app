"use client";

import { useState, useRef } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface MessageBubbleProps {
    message: any;
    currentUser: any;
}

export default function MessageBubble({ message, currentUser }: MessageBubbleProps) {
    const [activeMessageId, setActiveMessageId] = useState<Id<"messages"> | null>(null);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

    const deleteMessage = useMutation(api.messages.mutations.deleteMessage);

    const isMe = message.senderId === currentUser._id;

    const handlePressStart = () => {
        if (!isMe || message.isDeleted) return;
        longPressTimerRef.current = setTimeout(() => {
            setActiveMessageId(message._id);
        }, 500);
    };

    const handlePressEnd = () => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };

    let alignmentStyle = isMe ? "flex flex-col items-end" : "flex flex-col items-start";
    let bubbleStyles = "max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 relative group cursor-pointer ";
    let timeStyle = "text-[10px] mt-1 flex justify-end gap-2 items-center ";
    let messageText = message.isDeleted ? "This message was deleted" : message.content;

    if (message.isDeleted) {
        bubbleStyles += "bg-gray-200 text-gray-500 italic";
        timeStyle += "text-gray-400";
    } else if (isMe) {
        bubbleStyles += "bg-blue-600 text-white rounded-tr-none";
        timeStyle += "text-blue-200";
    } else {
        bubbleStyles += "bg-white text-gray-800 rounded-tl-none shadow-sm";
        timeStyle += "text-gray-400";
    }

    return (
        <div className={alignmentStyle}>
            <div
                className={bubbleStyles}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onTouchMove={handlePressEnd}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
            >
                <p className="wrap-break-word">{messageText}</p>
                <div className={timeStyle}>{formatTimestamp(message.createdAt)}</div>

                {isMe && !message.isDeleted && (
                    <button
                        onClick={() => {
                            deleteMessage({ messageId: message._id, userId: currentUser._id });
                            setActiveMessageId(null);
                        }}
                        className={`absolute top-2 -left-8 transition p-1 text-red-500 bg-white rounded-full shadow-sm md:opacity-0 md:group-hover:opacity-100 ${activeMessageId === message._id ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}