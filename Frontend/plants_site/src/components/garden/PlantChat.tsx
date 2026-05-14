// src/components/garden/PlantChat.tsx
import { motion } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:8000/api';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const PlantChat: React.FC<{ plantId: number; language: 'en' | 'fa' }> = ({ plantId, language }) => {
  const isEn = language === 'en';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/my-garden/chat/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ plant_id: plantId, message: input }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Request failed');
      }
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[480px] sm:h-[550px] bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-inner">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-lg shadow-md">
          🌿
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-white">
            {isEn ? 'Plant Assistant' : 'دستیار گیاه'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEn ? 'Ask me anything about this plant' : 'هر سوالی درباره این گیاه دارید بپرسید'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-green-500 text-white rounded-br-md'
                  : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-md border border-slate-200/60 dark:border-slate-600/50'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-200/60 dark:border-slate-600/50">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/50">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isEn ? 'Type your question...' : 'سوال خود را بنویسید...'}
            className="flex-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="p-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition shadow-md flex items-center justify-center"
          >
            <FiSend className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantChat;