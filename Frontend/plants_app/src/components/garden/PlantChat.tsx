import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send, Bot, User as UserIcon } from 'lucide-react-native';
import { Motion as _Motion } from '@legendapp/motion';
import { gardenService } from '../../services/api';
import { cn } from '../../utils/cn';

const MotionL = _Motion as any;

interface Message {
  sender: 'user' | 'ai';
  text: string;
  id: string;
}

interface PlantChatProps {
  plantId: number;
  language: 'en' | 'fa';
  className?: string;
}

export const PlantChat: React.FC<PlantChatProps> = ({ plantId, language, className }) => {
  const isEn = language === 'en';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { 
      sender: 'user', 
      text: input, 
      id: Date.now().toString() 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await gardenService.chatWithPlant(plantId, input);
      const aiMsg: Message = { 
        sender: 'ai', 
        text: response.reply, 
        id: (Date.now() + 1).toString() 
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = { 
        sender: 'ai', 
        text: `Error: ${err.message}`, 
        id: (Date.now() + 1).toString() 
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  return (
    <View className={cn("flex-1 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800", className)}>
      {/* Header */}
      <View className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-row items-center gap-3 bg-white dark:bg-slate-900">
        <View className="w-10 h-10 rounded-full bg-brand-500 items-center justify-center shadow-lg shadow-brand-500/30">
          <Bot size={20} color="white" />
        </View>
        <View>
          <Text className="font-bold text-slate-900 dark:text-white">
            {isEn ? 'Plant Assistant' : 'دستیار گیاه'}
          </Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {isEn ? 'Ask me anything about this plant' : 'هر سوالی دارید بپرسید'}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
            <View className="items-center justify-center py-10 opacity-40">
                <Bot size={48} color="#94a3b8" />
                <Text className="text-slate-500 mt-4 text-center px-10 text-xs font-medium">
                    {isEn 
                      ? "I can help you with watering schedules, health issues, or general care tips for this specific plant."
                      : "من می‌تونم در مورد زمان آبیاری، مشکلات سلامتی یا نکات مراقبتی این گیاه به شما کمک کنم."}
                </Text>
            </View>
        )}
        
        {messages.map((msg, i) => (
          <MotionL.View
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "mb-4 max-w-[85%]",
              msg.sender === 'user' ? "self-end" : "self-start"
            )}
          >
            <View className={cn(
              "px-4 py-3 rounded-2xl shadow-sm",
              msg.sender === 'user'
                ? "bg-brand-500 rounded-tr-none"
                : "bg-white dark:bg-slate-800 rounded-tl-none border border-slate-100 dark:border-slate-700"
            )}>
              <Text className={cn(
                "text-sm leading-5",
                msg.sender === 'user' ? "text-white font-medium" : "text-slate-800 dark:text-slate-200"
              )}>
                {msg.text}
              </Text>
            </View>
          </MotionL.View>
        ))}
        {loading && (
          <View className="self-start bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
            <ActivityIndicator size="small" color="#16a34a" />
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <View className="flex-row gap-2 items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-2 py-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={isEn ? 'Type your question...' : 'سوال خود را بپرسید...'}
              className="flex-1 px-3 py-2 text-slate-900 dark:text-white text-sm"
              placeholderTextColor="#94a3b8"
              multiline={false}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={loading || !input.trim()}
              className={cn(
                "w-10 h-10 rounded-xl items-center justify-center transition-all",
                input.trim() ? "bg-brand-500 shadow-lg shadow-brand-500/30" : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <Send size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
