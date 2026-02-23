"use client";

import { MessageCircle } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 space-y-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing/pulsing ring */}
        <div className="absolute w-24 h-24 bg-blue-400 rounded-full animate-ping opacity-20" />
        
        {/* Inner circle with icon */}
        <div className="relative w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-blue-50">
          <MessageCircle className="w-10 h-10 text-blue-600" />
          
          {/* Bouncing typing indicator dots */}
          <div className="absolute flex space-x-1 bg-white px-2 py-1.5 rounded-full shadow-md -bottom-2 -right-4 border border-gray-100">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
      
      {/* Loading Text */}
      <h2 className="text-lg font-medium text-gray-600 animate-pulse tracking-wide">
        {message}
      </h2>
    </div>
  );
}