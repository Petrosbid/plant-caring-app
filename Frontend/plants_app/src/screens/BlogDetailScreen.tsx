import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Image,
  ScrollView,
  useWindowDimensions,
  Pressable,
  Animated,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Eye,
  MessageCircle,
  Minus,
  Plus,
  Clock,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Send,
  User as LucideUser,
} from 'lucide-react-native';

import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { AppText as Text } from '../components/common/AppText';
import { blogService } from '../services/api';
import { Loader } from '../components/common/Loader';
import { formatDate } from '../utils/date';
import { getReadingFontSize, saveReadingFontSize } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

const FONT_MIN = 14;
const FONT_MAX = 24;
const FONT_STEP = 2;
const DEFAULT_FONT = 17;

const estimateReadTime = (html: string): number => {
  const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plain.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const BlogDetailScreen = ({ route, navigation }: any) => {
  const { slug } = route.params as { slug: string };
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isEn = i18n.language === 'en';
  const isDark = theme === 'dark';

  const scrollY = useRef(new Animated.Value(0)).current;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT);
  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(1);

  // New states
  const [activeTab, setActiveTab] = useState<'article' | 'comments' | 'related'>('article');
  const [comments, setComments] = useState<any[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const data = await blogService.getComments(slug);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }, [slug]);

  const fetchRelated = useCallback(async (tags: string[]) => {
    try {
      const response = await blogService.getPosts({ tags: tags.join(','), limit: 6 });
      const filtered = response.results.filter((p: any) => p.slug !== slug);
      setRelatedPosts(filtered);
    } catch (err) {
      console.error('Failed to fetch related posts:', err);
    }
  }, [slug]);

  useEffect(() => {
    getReadingFontSize().then((saved) => {
      if (saved && saved >= FONT_MIN && saved <= FONT_MAX) {
        setFontSize(saved);
      }
    });
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await blogService.getPostBySlug(slug);
        setPost(data);
        setLikes(data.likes_count || 0);
        setDislikes(data.dislikes_count || 0);
        setUserVote(data.user_has_liked ? 'like' : data.user_has_disliked ? 'dislike' : null);
        
        // Fetch comments and related posts
        fetchComments();
        if (data.tags && data.tags.length > 0) {
          fetchRelated(data.tags);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, fetchComments, fetchRelated]);

  const handlePostVote = async (type: 'like' | 'dislike') => {
    if (userVote === type) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await (type === 'like'
        ? blogService.likePost(slug)
        : blogService.dislikePost(slug));

      setLikes(response.likes_count);
      setDislikes(response.dislikes_count);
      setUserVote(response.user_has_liked ? 'like' : response.user_has_disliked ? 'dislike' : null);
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const handleCommentVote = async (commentId: number, voteType: 1 | -1) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updatedComment = await blogService.voteComment(commentId, voteType);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, ...updatedComment } : c));
    } catch (err) {
      console.error('Failed to vote on comment:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await blogService.addComment(slug, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeFontSize = useCallback((delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(FONT_MAX, Math.max(FONT_MIN, prev + delta));
      if (next !== prev) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        saveReadingFontSize(next);
      }
      return next;
    });
  }, []);

  const progressWidth = scrollY.interpolate({
    inputRange: [0, Math.max(contentHeight - scrollViewHeight, 1)],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120, 200],
    outputRange: [0, 0.6, 1],
    extrapolate: 'clamp',
  });

  const contentPadding = 28;
  const contentWidth = width - contentPadding * 2;

  const htmlConfig = useMemo(() => {
    if (!post) return null;
    const content = isEn && post.content_en ? post.content_en : post.content;
    const textColor = isDark ? '#cbd5e1' : '#334155';
    const headingColor = isDark ? '#f1f5f9' : '#0f172a';
    const textAlign = isEn ? ('left' as const) : ('right' as const);

    return {
      content,
      source: {
        html: `<div style="color: ${textColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.85;">${content}</div>`,
      },
      tagsStyles: {
        p: {
          marginBottom: fontSize * 1.1,
          textAlign,
          lineHeight: fontSize * 1.85,
        },
        h1: {
          marginTop: fontSize * 2,
          marginBottom: fontSize * 0.8,
          fontSize: fontSize + 8,
          fontWeight: '800' as const,
          color: headingColor,
          textAlign,
        },
        h2: {
          marginTop: fontSize * 1.8,
          marginBottom: fontSize * 0.7,
          fontSize: fontSize + 5,
          fontWeight: '700' as const,
          color: headingColor,
          textAlign,
        },
        h3: {
          marginTop: fontSize * 1.5,
          marginBottom: fontSize * 0.5,
          fontSize: fontSize + 3,
          fontWeight: '700' as const,
          color: isDark ? '#e2e8f0' : '#1e293b',
          textAlign,
        },
        li: {
          marginBottom: fontSize * 0.5,
          lineHeight: fontSize * 1.75,
          textAlign,
        },
        ul: { marginBottom: fontSize, paddingLeft: isEn ? 20 : 0, paddingRight: isEn ? 0 : 20 },
        ol: { marginBottom: fontSize, paddingLeft: isEn ? 20 : 0, paddingRight: isEn ? 0 : 20 },
        blockquote: {
          borderLeftWidth: isEn ? 3 : 0,
          borderRightWidth: isEn ? 0 : 3,
          borderColor: '#16a34a',
          paddingLeft: isEn ? 16 : 0,
          paddingRight: isEn ? 0 : 16,
          marginVertical: fontSize,
          fontStyle: 'italic' as const,
          opacity: 0.9,
        },
        a: { color: '#16a34a', textDecorationLine: 'underline' as const },
        img: { borderRadius: 12, marginVertical: fontSize },
        strong: { fontWeight: '700' as const, color: headingColor },
        em: { fontStyle: 'italic' as const },
      },
    };
  }, [post, isEn, isDark, fontSize]);

  if (loading || !post || !htmlConfig) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader size={20} />
      </View>
    );
  }

  const title = isEn && post.title_en ? post.title_en : post.title;
  const readTime = estimateReadTime(htmlConfig.content);
  const authorInitials = `${post.author?.first_name?.[0] ?? ''}${post.author?.last_name?.[0] ?? ''}`;
  const fontScale = Math.round((fontSize / DEFAULT_FONT) * 100);

  return (
    <ScreenWrapper withScroll={false} padding={false}>
      <View className="flex-1 bg-slate-50 dark:bg-slate-950">
        {/* Reading progress */}
        <View
          className="absolute left-0 right-0 z-50 bg-slate-200/60 dark:bg-slate-800/60"
          style={{ top: Platform.OS === 'ios' ? insets.top : 0, height: 3 }}
        >
          <Animated.View
            className="h-full bg-brand-500 rounded-r-full"
            style={{ width: progressWidth }}
          />
        </View>

        {/* Floating header */}
        <Animated.View
          className="absolute left-0 right-0 z-40 overflow-hidden"
          style={{
            top: Platform.OS === 'ios' ? insets.top : 0,
            opacity: headerOpacity,
          }}
          pointerEvents="none"
        >
          <BlurView
            intensity={isDark ? 60 : 80}
            tint={isDark ? 'dark' : 'light'}
            className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50"
          >
            <Text
              className="text-sm font-bold text-slate-800 dark:text-white text-center"
              numberOfLines={1}
            >
              {title}
            </Text>
          </BlurView>
        </Animated.View>

        {/* Top controls */}
        <View
          className="absolute left-0 right-0 z-50 flex-row items-center justify-between px-4"
          style={{ top: (Platform.OS === 'ios' ? insets.top : 0) + 12 }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-11 h-11 rounded-full bg-white/90 dark:bg-slate-900/90 items-center justify-center shadow-md border border-white/40 dark:border-slate-700/60"
          >
            <ArrowLeft size={20} color={isDark ? '#e2e8f0' : '#1e293b'} />
          </Pressable>

          <View className="flex-row items-center rounded-full overflow-hidden border border-white/40 dark:border-slate-700/60 shadow-md">
            <BlurView
              intensity={isDark ? 50 : 70}
              tint={isDark ? 'dark' : 'light'}
              className="flex-row items-center px-1 py-1"
            >
              <Pressable
                onPress={() => changeFontSize(-FONT_STEP)}
                disabled={fontSize <= FONT_MIN}
                className="w-9 h-9 items-center justify-center rounded-full active:bg-slate-200/50 dark:active:bg-slate-700/50"
                style={{ opacity: fontSize <= FONT_MIN ? 0.35 : 1 }}
              >
                <Minus size={16} color={isDark ? '#94a3b8' : '#64748b'} />
              </Pressable>

              <View className="px-2 min-w-[44px] items-center">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isEn ? 'Text' : 'متن'}
                </Text>
                <Text className="text-xs font-black text-brand-600 dark:text-brand-400">
                  {fontScale}%
                </Text>
              </View>

              <Pressable
                onPress={() => changeFontSize(FONT_STEP)}
                disabled={fontSize >= FONT_MAX}
                className="w-9 h-9 items-center justify-center rounded-full active:bg-brand-100/50 dark:active:bg-brand-900/30"
                style={{ opacity: fontSize >= FONT_MAX ? 0.35 : 1 }}
              >
                <Plus size={16} color="#16a34a" />
              </Pressable>
            </BlurView>
          </View>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          onContentSizeChange={(_, h) => setContentHeight(h)}
          onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Hero */}
          <View className="relative w-full" style={{ height: 340 }}>
            <Image
              source={{ uri: post.cover_image }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/25" />
            <LinearGradient
              colors={['transparent', isDark ? 'rgba(2, 6, 23, 0.95)' : 'rgba(248, 250, 252, 1)']}
              className="absolute inset-x-0 bottom-0 h-40"
            />
          </View>

          {/* Article body */}
          <View
            className="-mt-16 px-7 pt-2 pb-10 bg-slate-50 dark:bg-slate-950 rounded-t-[36px]"
            style={{ minHeight: 400 }}
          >
            {/* Meta chips */}
            <View className="flex-row flex-wrap items-center gap-2 mb-5">
              {post.category ? (
                <View className="bg-brand-100 dark:bg-brand-900/40 px-3 py-1.5 rounded-full">
                  <Text className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
                    {post.category}
                  </Text>
                </View>
              ) : null}
              <View className="bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {formatDate(post.publish, i18n.language)}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                <Clock size={12} color="#16a34a" />
                <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {readTime} {isEn ? 'min read' : 'دقیقه مطالعه'}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text
              className="text-[28px] font-black text-slate-900 dark:text-white leading-[38px] mb-6 text-start"
            >
              {title}
            </Text>

            {/* Stats + author */}
            <View className="flex-row items-center justify-between mb-8">
              <View className="flex-row items-center gap-3">
                <View className="w-11 h-11 rounded-2xl bg-brand-500 items-center justify-center shadow-lg shadow-brand-500/25">
                  <Text className="text-sm font-black text-white">{authorInitials}</Text>
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">
                    {post.author.first_name} {post.author.last_name}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    {isEn ? 'Author' : 'نویسنده'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <Eye size={15} color="#94a3b8" />
                  <Text className="text-xs font-bold text-slate-400">{post.view_count}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <MessageCircle size={15} color="#94a3b8" />
                  <Text className="text-xs font-bold text-slate-400">{post.comments_count}</Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-3 mb-8">
              <View className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <View className="w-2 h-2 rounded-full bg-brand-500/30" />
              <View className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </View>

            {/* Tab Bar */}
            <View className="flex-row items-center bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-1 mb-6">
              <Pressable
                onPress={() => {
                  setActiveTab('article');
                  Haptics.selectionAsync();
                }}
                className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl ${
                  activeTab === 'article' ? 'bg-white dark:bg-slate-800' : ''
                }`}
              >
                <BookOpen size={16} color={activeTab === 'article' ? '#16a34a' : '#94a3b8'} />
                <Text className={`text-xs font-bold ${activeTab === 'article' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {isEn ? 'Article' : 'متن'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setActiveTab('comments');
                  Haptics.selectionAsync();
                }}
                className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl ${
                  activeTab === 'comments' ? 'bg-white dark:bg-slate-800' : ''
                }`}
              >
                <MessageCircle size={16} color={activeTab === 'comments' ? '#16a34a' : '#94a3b8'} />
                <Text className={`text-xs font-bold ${activeTab === 'comments' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {isEn ? 'Comments' : 'نظرات'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setActiveTab('related');
                  Haptics.selectionAsync();
                }}
                className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl ${
                  activeTab === 'related' ? 'bg-white dark:bg-slate-800' : ''
                }`}
              >
                <LucideUser size={16} color={activeTab === 'related' ? '#16a34a' : '#94a3b8'} />
                <Text className={`text-xs font-bold ${activeTab === 'related' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {isEn ? 'Related' : 'مرتبط'}
                </Text>
              </Pressable>
            </View>

            {/* Tab Content */}
            {activeTab === 'article' && (
              <View className="bg-white dark:bg-slate-900/60 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <RenderHtml
                  contentWidth={contentWidth - 40}
                  source={htmlConfig.source}
                  baseStyle={{
                    color: isDark ? '#cbd5e1' : '#334155',
                    fontSize,
                    lineHeight: fontSize * 1.85,
                    letterSpacing: 0.2,
                  }}
                  tagsStyles={htmlConfig.tagsStyles}
                />
                
                {/* End marker */}
                <View className="items-center mt-12 mb-4">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-px bg-slate-200 dark:bg-slate-700" />
                    <Text className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[3px]">
                      {isEn ? 'End of article' : 'پایان مطلب'}
                    </Text>
                    <View className="w-8 h-px bg-slate-200 dark:bg-slate-700" />
                  </View>
                </View>

                                {/* Post Voting */}
                <View className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm items-center">
                  <Text className="text-sm font-bold text-slate-800 dark:text-white mb-4">
                    {isEn ? 'Was this article helpful?' : 'آیا این مطلب مفید بود؟'}
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <Pressable
                      onPress={() => handlePostVote('like')}
                      className={`flex-row items-center gap-2 px-6 py-3 rounded-2xl border ${
                        userVote === 'like'
                          ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800'
                          : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700'
                      }`}
                    >
                      <ThumbsUp size={18} color={userVote === 'like' ? '#16a34a' : '#94a3b8'} />
                      <Text className={`font-black ${userVote === 'like' ? 'text-brand-600' : 'text-slate-400'}`}>
                        {likes}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handlePostVote('dislike')}
                      className={`flex-row items-center gap-2 px-6 py-3 rounded-2xl border ${
                        userVote === 'dislike'
                          ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800'
                          : 'bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-700'
                      }`}
                    >
                      <ThumbsDown size={18} color={userVote === 'dislike' ? '#e11d48' : '#94a3b8'} />
                      <Text className={`font-black ${userVote === 'dislike' ? 'text-rose-600' : 'text-slate-400'}`}>
                        {dislikes}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'comments' && (
              <View className="gap-6">
                {/* Add Comment */}
                <View className="bg-white dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <View className={`flex-row items-start gap-3 ${isEn ? '' : 'flex-row-reverse'}`}>
                    <View className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
                      <LucideUser size={20} color="#16a34a" />
                    </View>
                    <View className="flex-1">
                      <TextInput
                        multiline
                        placeholder={isEn ? "Share your thoughts..." : "نظرات خود را بنویسید..."}
                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                        value={newComment}
                        onChangeText={setNewComment}
                        className="text-sm text-slate-800 dark:text-white py-2 min-h-[80px] text-start"
                        textAlignVertical="top"
                      />
                      <View className={`flex-row justify-end mt-2 ${isEn ? '' : 'flex-row-reverse'}`}>
                        <Pressable
                          onPress={handleAddComment}
                          disabled={!newComment.trim() || isSubmitting}
                          className={`flex-row items-center gap-2 px-5 py-2.5 rounded-xl ${
                            !newComment.trim() || isSubmitting
                              ? 'bg-slate-100 dark:bg-slate-800/50'
                              : 'bg-brand-500'
                          }`}
                        >
                          {isSubmitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <Text className={`text-xs font-bold ${!newComment.trim() || isSubmitting ? 'text-slate-400' : 'text-white'}`}>
                                {isEn ? 'Post' : 'ارسال'}
                              </Text>
                              <Send size={14} color={!newComment.trim() || isSubmitting ? '#94a3b8' : '#fff'} />
                            </>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Comments List */}
                <View className="gap-4">
                  <Text className="text-lg font-black text-slate-900 dark:text-white mb-2 text-start">
                    {isEn ? `Comments (${comments.length})` : `نظرات (${comments.length})`}
                  </Text>
                  {comments.length === 0 ? (
                    <View className="items-center py-10">
                      <MessageCircle size={40} color={isDark ? '#334155' : '#e2e8f0'} />
                      <Text className="text-sm text-slate-400 mt-4">
                        {isEn ? 'No comments yet. Be the first!' : 'هنوز نظری ثبت نشده است.'}
                      </Text>
                    </View>
                  ) : (
                    comments.map((comment) => (
                      <View key={comment.id} className="bg-white dark:bg-slate-900/60 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <View className={`flex-row items-center justify-between mb-4 ${isEn ? '' : 'flex-row-reverse'}`}>
                          <View className={`flex-row items-center gap-3 ${isEn ? '' : 'flex-row-reverse'}`}>
                            <View className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                              <Text className="text-xs font-bold text-slate-500">
                                {comment.author?.[0]?.toUpperCase() || 'A'}
                              </Text>
                            </View>
                            <View>
                              <Text className="text-sm font-bold text-slate-800 dark:text-white">
                                {comment.author}
                              </Text>
                              <Text className="text-[10px] text-slate-400 mt-0.5">
                                {formatDate(comment.created_at, i18n.language)}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Comment Voting */}
                          <View className={`flex-row items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full ${isEn ? '' : 'flex-row-reverse'}`}>
                            <Pressable onPress={() => handleCommentVote(comment.id, 1)}>
                              <ThumbsUp size={14} color={comment.user_vote === 1 ? '#16a34a' : '#94a3b8'} />
                            </Pressable>
                            <Text className={`text-xs font-bold ${comment.score > 0 ? 'text-brand-600' : comment.score < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                              {comment.score || 0}
                            </Text>
                            <Pressable onPress={() => handleCommentVote(comment.id, -1)}>
                              <ThumbsDown size={14} color={comment.user_vote === -1 ? '#e11d48' : '#94a3b8'} />
                            </Pressable>
                          </View>
                        </View>
                        <Text className={`text-sm leading-6 text-slate-600 dark:text-slate-300 ${isEn ? '' : 'text-right'}`}>
                          {comment.content}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}

            {activeTab === 'related' && (
              <View className="gap-6">
                <Text className={`text-lg font-black text-slate-900 dark:text-white mb-2 ${isEn ? '' : 'text-right'}`}>
                  {isEn ? 'Related Articles' : 'مطالب مرتبط'}
                </Text>
                {relatedPosts.length === 0 ? (
                  <View className="items-center py-10">
                    <BookOpen size={40} color={isDark ? '#334155' : '#e2e8f0'} />
                    <Text className="text-sm text-slate-400 mt-4">
                      {isEn ? 'No related articles found.' : 'مطلب مرتبطی یافت نشد.'}
                    </Text>
                  </View>
                ) : (
                  <View className="gap-4">
                    {relatedPosts.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          navigation.push('BlogDetail', { slug: item.slug });
                        }}
                        className={`bg-white dark:bg-slate-900/60 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex-row h-28 ${isEn ? '' : 'flex-row-reverse'}`}
                      >
                        <Image
                          source={{ uri: item.cover_image }}
                          className="w-28 h-full"
                          resizeMode="cover"
                        />
                        <View className="flex-1 p-4 justify-center">
                          <Text
                            numberOfLines={2}
                            className={`text-sm font-bold text-slate-800 dark:text-white leading-5 ${isEn ? '' : 'text-right'}`}
                          >
                            {isEn && item.title_en ? item.title_en : item.title}
                          </Text>
                          <View className={`flex-row items-center gap-3 mt-2 ${isEn ? '' : 'flex-row-reverse'}`}>
                            <View className={`flex-row items-center gap-1 ${isEn ? '' : 'flex-row-reverse'}`}>
                              <Eye size={12} color="#94a3b8" />
                              <Text className="text-[10px] text-slate-400 font-bold">{item.view_count}</Text>
                            </View>
                            <View className={`flex-row items-center gap-1 ${isEn ? '' : 'flex-row-reverse'}`}>
                              <Clock size={12} color="#94a3b8" />
                              <Text className="text-[10px] text-slate-400 font-bold">
                                {formatDate(item.publish, i18n.language)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default BlogDetailScreen;
