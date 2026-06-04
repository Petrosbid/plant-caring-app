import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, Bot, Sparkles } from 'lucide-react-native';
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

const SUGGESTIONS_EN = [
  'When should I water next?',
  'Signs of overwatering?',
  'Best light for this plant?',
];
const SUGGESTIONS_FA = [
  'کی باید آبیاری کنم؟',
  'علائم آبیاری زیاد چیست؟',
  'بهترین نور برای این گیاه؟',
];

export const PlantChat: React.FC<PlantChatProps> = ({ plantId, language, className }) => {
  const isEn = language === 'en';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const suggestions = isEn ? SUGGESTIONS_EN : SUGGESTIONS_FA;

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: content,
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await gardenService.chatWithPlant(plantId, content);
      const aiMsg: Message = {
        sender: 'ai',
        text: response.reply,
        id: (Date.now() + 1).toString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        sender: 'ai',
        text: isEn ? `Sorry, something went wrong: ${err.message}` : `خطا: ${err.message}`,
        id: (Date.now() + 1).toString(),
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
    <View
      className={cn(
        'flex-1 bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm',
        className
      )}
    >
      <View className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-2xl bg-brand-500 items-center justify-center shadow-lg shadow-brand-500/30">
          <Bot size={22} color="white" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="font-black text-slate-900 dark:text-white">
              {isEn ? 'Plant Assistant' : 'دستیار گیاه'}
            </Text>
            <Sparkles size={14} color="#16a34a" />
          </View>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {isEn ? 'Personalized care for this plant' : 'مراقبت اختصاصی برای این گیاه'}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4 py-3"
        contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <View className="items-center py-8">
            <View className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/30 items-center justify-center mb-4">
              <Bot size={32} color="#16a34a" />
            </View>
            <Text className="text-slate-600 dark:text-slate-300 text-center px-6 text-sm font-medium leading-5">
              {isEn
                ? 'Ask about watering, health issues, fertilizing, or seasonal care tips.'
                : 'در مورد آبیاری، سلامت، کوددهی یا نکات فصلی سوال بپرسید.'}
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2 mt-5 px-2">
              {suggestions.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => sendMessage(s)}
                  className="px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <Text className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg) => (
          <MotionL.View
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn('mb-3 max-w-[88%]', msg.sender === 'user' ? 'self-end' : 'self-start')}
          >
            <View
              className={cn(
                'px-4 py-3 rounded-[20px]',
                msg.sender === 'user'
                  ? 'bg-brand-500 rounded-br-sm'
                  : 'bg-slate-50 dark:bg-slate-800 rounded-bl-sm border border-slate-100 dark:border-slate-700'
              )}
            >
              <Text
                className={cn(
                  'text-sm leading-5',
                  msg.sender === 'user' ? 'text-white font-medium' : 'text-slate-800 dark:text-slate-200'
                )}
              >
                {msg.text}
              </Text>
            </View>
          </MotionL.View>
        ))}
        {loading && (
          <View className="self-start bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700">
            <ActivityIndicator size="small" color="#16a34a" />
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="p-3 border-t border-slate-100 dark:border-slate-800">
          <View className="flex-row gap-2 items-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-2 py-2 border border-slate-100 dark:border-slate-700">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={isEn ? 'Ask about this plant...' : 'سوال خود را بپرسید...'}
              className="flex-1 px-3 py-2.5 text-slate-900 dark:text-white text-sm"
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              onPress={() => sendMessage()}
              disabled={loading || !input.trim()}
              className={cn(
                'w-11 h-11 rounded-xl items-center justify-center',
                input.trim() ? 'bg-brand-500 shadow-md shadow-brand-500/25' : 'bg-slate-200 dark:bg-slate-700'
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
