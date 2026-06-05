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
      style={{
        flex: 1,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
      }}
    >
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        backgroundColor: '#a1f0bd',
        borderBottomColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 16,
          backgroundColor: '#16a34a',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Bot size={22}/>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontWeight: '900', color: '#0f172a' }}>
              {isEn ? 'Plant Assistant' : 'دستیار گیاه'}
            </Text>
            <Sparkles size={14} color="#16a34a" />
          </View>
          <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '500' }}>
            {isEn ? 'Personalized care for this plant' : 'مراقبت اختصاصی برای این گیاه'}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Bot size={32} color="#16a34a" />
            </View>
            <Text style={{
              color: '#475569',
              textAlign: 'center',
              paddingHorizontal: 24,
              fontSize: 14,
              fontWeight: '500',
              lineHeight: 20,
            }}>
              {isEn
                ? 'Ask about watering, health issues, fertilizing, or seasonal care tips.'
                : 'در مورد آبیاری، سلامت، کوددهی یا نکات فصلی سوال بپرسید.'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              {suggestions.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => sendMessage(s)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg) => (
          <View
            key={msg.id}
            style={{
              marginBottom: 12,
              maxWidth: '88%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 20,
                borderBottomRightRadius: msg.sender === 'user' ? 4 : 20,
                borderBottomLeftRadius: msg.sender === 'ai' ? 4 : 20,
                backgroundColor: msg.sender === 'user' ? '#16a34a' : '#f8fafc',
                borderWidth: msg.sender === 'ai' ? 1 : 0,
                borderColor: '#f1f5f9',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: msg.sender === 'user' ? 'white' : '#1e293b',
                  fontWeight: msg.sender === 'user' ? '500' : '400',
                }}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            borderWidth: 1,
            borderColor: '#f1f5f9',
          }}>
            <ActivityIndicator size="small" color="#16a34a" />
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          <View style={{
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
            borderRadius: 16,
            padding: 8,
            borderWidth: 1,
            borderColor: '#f1f5f9',
          }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={isEn ? 'Ask about this plant...' : 'سوال خود را بپرسید...'}
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: '#0f172a',
                fontSize: 14,
              }}
              placeholderTextColor="#94a3b8"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: input.trim() ? '#16a34a' : '#e2e8f0',
              }}
            >
              <Send size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
