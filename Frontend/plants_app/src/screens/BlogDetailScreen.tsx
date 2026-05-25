import React, { useState, useEffect } from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { blogService } from '../services/api';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import RenderHtml from 'react-native-render-html';
import { formatDate } from '../utils/date';
import { ArrowLeft, Eye, MessageCircle } from 'lucide-react-native';

const BlogDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { slug } = route.params as { slug: string };
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const isEn = i18n.language === 'en';

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await blogService.getPostBySlug(slug);
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={20} />
      </View>
    );
  }

  const title = isEn && post.title_en ? post.title_en : post.title;
  const content = isEn && post.content_en ? post.content_en : post.content;

  const htmlSource = {
    html: `<div style="color: #334155; font-family: sans-serif; line-height: 1.6; text-align: justify;">${content}</div>`
  };

  return (
    <ScreenWrapper padding={false}>
      <View className="relative h-80 w-full">
        <Image 
          source={{ uri: post.cover_image }} 
          className="w-full h-full" 
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/40" />
        <View className="absolute top-12 left-4 z-20">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full w-10 h-10 p-0"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color="#000" />
          </Button>
        </View>
      </View>

      <View className="p-6 -mt-10 bg-white dark:bg-slate-900 rounded-t-[40px] shadow-2xl">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="bg-brand-100 dark:bg-brand-900/30 px-3 py-1 rounded-full">
            <Text className="text-[10px] font-bold text-brand-700 dark:text-brand-400 uppercase tracking-widest">
              {formatDate(post.publish, i18n.language)}
            </Text>
          </View>
          <View className="flex-row items-center gap-3 ml-auto">
             <View className="flex-row items-center gap-1">
                <Eye size={16} color="#94a3b8" />
                <Text className="text-[10px] text-slate-400 font-bold">{post.view_count}</Text>
             </View>
             <View className="flex-row items-center gap-1">
                <MessageCircle size={16} color="#94a3b8" />
                <Text className="text-[10px] text-slate-400 font-bold">{post.comments_count}</Text>
             </View>
          </View>
        </View>

        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
          {title}
        </Text>

        <View className="flex-row items-center gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
           <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
              <Text className="text-sm font-bold text-slate-500">{post.author.first_name?.[0]}{post.author.last_name?.[0]}</Text>
           </View>
           <View>
              <Text className="text-sm font-bold text-slate-800 dark:text-white">{post.author.first_name} {post.author.last_name}</Text>
              <Text className="text-xs text-slate-400">{isEn ? "Author" : "نویسنده"}</Text>
           </View>
        </View>

        <RenderHtml
          contentWidth={width - 48}
          source={htmlSource}
          baseStyle={{
            color: i18n.language === 'en' ? '#475569' : '#cbd5e1',
            fontSize: 16,
          }}
          tagsStyles={{
            p: { marginBottom: 20, textAlign: 'justify' },
            h2: { marginTop: 30, marginBottom: 15, fontStyle: 'normal', color: theme === 'dark' ? '#fff' : '#1e293b' },
            li: { marginBottom: 10 }
          }}
        />
      </View>
    </ScreenWrapper>
  );
};

export default BlogDetailScreen;
