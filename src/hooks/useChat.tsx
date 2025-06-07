import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "./useAuth";
import { ChatMessage } from "../types/game";
import { Id } from "../../convex/_generated/dataModel";

export const useChat = (gameId: Id<"games"> | null) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");

  const messages = useQuery(
    api.chat.listMessagesByGame,
    gameId ? { gameId } : "skip"
  ) as ChatMessage[] | undefined;

  const sendMessage = useMutation(api.chat.createMessage);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || message.trim();

    if (!messageText || !gameId || !user) return;

    try {
      await sendMessage({
        gameId,
        userId: user._id,
        message: messageText,
        username: user.username,
        timestamp: Date.now(),
      });

      if (!text) {
        setMessage("");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const sendQuickMessage = (quickMessage: string) => {
    handleSendMessage(quickMessage);
  };

  return {
    messages: messages || [],
    message,
    setMessage,
    handleSendMessage,
    sendQuickMessage,
  };
};
