"use client";

import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

// Define the Message type expected by the component
export interface Message {
  type: "error" | "success" | "info" | "warning";
  text: string;
}

interface FormMessageProps {
  message?: Message | string; // Allow either a Message object or a simple string
  className?: string;
}

export function FormMessage({ message, className }: FormMessageProps) {
  if (!message) {
    return null;
  }

  // Handle both string and Message object inputs
  const messageText = typeof message === "string" ? message : message.text;
  const messageType = typeof message === "string" ? "error" : message.type; // Default to 'error' if only string is passed

  const baseClasses = "p-3 rounded-md text-sm";
  const typeClasses = {
    error: "bg-red-100 border border-red-200 text-red-800",
    success: "bg-green-100 border border-green-200 text-green-800",
    info: "bg-blue-100 border border-blue-200 text-blue-800",
    warning: "bg-yellow-100 border border-yellow-200 text-yellow-800",
  };

  return (
    <p className={cn(baseClasses, typeClasses[messageType], className)}>
      {messageText}
    </p>
  );
}
