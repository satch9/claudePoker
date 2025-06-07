import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import { Id } from "../../../convex/_generated/dataModel";
import { Player } from "../../types/game";

const GameChat: React.FC<{ gameId: Id<"games">; players: Player[] }> = ({
  gameId,
  players,
}) => {
  const { user } = useAuth();
  const { messages, handleSendMessage } = useChat(gameId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;
    await handleSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-black/80 rounded-b-xl p-2 text-xs">
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {messages.map((msg) => (
          <div key={msg._id} className="text-gray-200">
            <span className="font-semibold">{msg.username}:</span>{" "}
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex mt-1">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Votre message..."
          className="flex-1 px-2 py-1 rounded-l bg-gray-900 text-xs text-white border border-gray-700 focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-r text-xs font-semibold"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default GameChat;
