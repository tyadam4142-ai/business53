import React from 'react';
import { ChatMessage, MessageAuthor } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.author === MessageAuthor.USER;
  const isModel = message.author === MessageAuthor.MODEL;
  const isSystem = message.author === MessageAuthor.SYSTEM;

  const containerClasses = () => {
    if (isUser) return 'flex flex-col items-end';
    if (isModel) return 'flex flex-col items-start';
    return 'flex flex-col items-center';
  }

  const bubbleClasses = () => {
    if (isUser) return 'bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-l-2xl rounded-t-2xl';
    if (isModel) return 'bg-slate-700 text-gray-200 rounded-r-2xl rounded-t-2xl';
    return 'bg-transparent text-yellow-400/80 text-center text-sm italic border border-dashed border-yellow-500/30 rounded-lg';
  };

  const authorLabel = () => {
    if (isUser) return "You";
    if (isModel) return "business53";
    return null;
  };
  
  const authorClass = () => {
      if (isUser) return 'text-right text-blue-300';
      if (isModel) return 'text-left text-yellow-400';
      return 'hidden';
  }

  return (
    <div className={`w-full ${containerClasses()}`}>
        {authorLabel() && <span className={`text-xs font-bold mb-1 px-1 ${authorClass()}`}>{authorLabel()}</span>}
        <div className={`p-4 shadow-lg w-fit max-w-full ${bubbleClasses()}`}>
            <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
    </div>
  );
};

export default ChatMessageComponent;
