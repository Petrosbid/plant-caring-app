import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Image,
  useWindowDimensions,
  Pressable,
  Animated,
  Platform,
  Share,
  Linking,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  Share2,
  X,
} from 'lucide-react-native';

import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { AppText as Text } from '../components/common/AppText';
import { blogService, BLOG_SHARE_BASE_URL } from '../services/api';
import { Loader } from '../components/common/Loader';
import { formatDate } from '../utils/date';
import { getReadingFontSize, saveReadingFontSize } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';

const FONT_MIN = 14;
const FONT_MAX = 24;
const FONT_STEP = 2;
const DEFAULT_FONT = 17;

type TabKey = 'article' | 'comments';

interface BlogComment {
  id: number;
  author: string | { username?: string; first_name?: string; last_name?: string };
  content: string;
  created_at: string;
}

const estimateReadTime = (html: string): number => {
  const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plain.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const BlogDetailScreen = () => {
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { slug } = route.params as { slug: string };
  const { i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const isEn = i18n.language === 'en';
  const isDark = theme === 'dark';

  const scrollY = useRef(new Animated.Value(0)).current;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT);
  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>('article');

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [voting, setVoting] = useState(false);

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    getReadingFontSize().then((saved) => {
      if (saved && saved >= FONT_MIN && saved <= FONT_MAX) {
        setFontSize(saved);
      }
    });
  }, []);

  const fetchComments = useCallback(async (postSlug: string) => {
    try {
      setCommentsLoading(true);
      const data = await blogService.getComments(postSlug);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await blogService.getPostBySlug(slug);
        setPost(data);
        setLikes(data.likes_count || 0);
        setDislikes(data.dislikes_count || 0);
        setCommentCount(data.comments_count || 0);
        if (data.user_has_liked) setUserVote('like');
        else if (data.user_has_disliked) setUserVote('dislike');
        else setUserVote(null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post?.slug) fetchComments(post.slug);
  }, [post?.slug, fetchComments]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!post?.tags?.length) return;
      try {
        const data = await blogService.getPosts({
          tags: post.tags.join(','),
          page_size: 5,
        });
        const filtered = (data.results || [])
          .filter((p: any) => p.slug !== slug)
          .slice(0, 4);
        setRelatedPosts(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRelated();
  }, [post, slug]);

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

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!post || userVote === type || voting) return;
    try {
      setVoting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response =
        type === 'like'
          ? await blogService.likePost(post.slug)
          : await blogService.dislikePost(post.slug);
      setLikes(response.likes_count);
      setDislikes(response.dislikes_count);
      setUserVote(
        response.user_has_liked
          ? 'like'
          : response.user_has_disliked
            ? 'dislike'
            : null,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  };

  const handleAddComment = async () => {
    if (!post || !newComment.trim() || submittingComment) return;
    try {
      setSubmittingComment(true);
      await blogService.addComment(post.slug, { content: newComment.trim() });
      setNewComment('');
      setCommentCount((prev) => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await fetchComments(post.slug);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const shareUrl = `${BLOG_SHARE_BASE_URL}/blog/${slug}`;

  const getShareTitle = () =>
    isEn && post?.title_en ? post.title_en : post?.title || '';

  const handleNativeShare = async () => {
    const shareTitle = getShareTitle();
    try {
      await Share.share({
        message: `${shareTitle}\n\n${shareUrl}`,
        url: shareUrl,
        title: shareTitle,
      });
    } catch (err) {
      console.error(err);
    }
    setShowShareModal(false);
  };

  const openSocialShare = (platform: 'telegram' | 'whatsapp' | 'twitter') => {
    const shareTitle = getShareTitle();
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const urls = {
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    };
    Linking.openURL(urls[platform]).catch(console.error);
    setShowShareModal(false);
  };

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
        ul: {
          marginBottom: fontSize,
          paddingLeft: isEn ? 20 : 0,
          paddingRight: isEn ? 0 : 20,
        },
        ol: {
          marginBottom: fontSize,
          paddingLeft: isEn ? 20 : 0,
          paddingRight: isEn ? 0 : 20,
        },
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

  const renderCommentsTab = () => (
    <View className="mt-2">
      {isAuthenticated ? (
        <View className="bg-white dark:bg-slate-900/60 rounded-3xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder={
              isEn ? 'Share your thoughts...' : 'نظرات خود را بنویسید...'
            }
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className={`min-h-[100px] text-sm text-slate-800 dark:text-white p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 ${isEn ? 'text-left' : 'text-right'}`}
            style={{ fontFamily: isEn ? 'Inter_400Regular' : 'Vazirmatn_400Regular' }}
          />
          <Pressable
            onPress={handleAddComment}
            disabled={!newComment.trim() || submittingComment}
            className={`mt-3 h-12 rounded-2xl items-center justify-center bg-brand-500 shadow-lg shadow-brand-500/30 ${!newComment.trim() || submittingComment ? 'opacity-50' : ''}`}
          >
            {submittingComment ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-sm font-bold text-white">
                {isEn ? 'Post Comment' : 'ارسال نظر'}
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View className="bg-brand-50 dark:bg-brand-900/20 rounded-3xl p-6 mb-6 border border-brand-100 dark:border-brand-800 items-center">
          <MessageCircle size={32} color="#16a34a" />
          <Text className="text-sm text-slate-600 dark:text-slate-300 text-center mt-3 mb-4 leading-5">
            {isEn
              ? 'You must be logged in to post a comment.'
              : 'برای ثبت نظر ابتدا باید وارد حساب کاربری خود شوید.'}
          </Text>
          <View className="flex-row gap-3 w-full">
            <Pressable
              onPress={() => logout()}
              className="flex-1 h-12 rounded-2xl items-center justify-center bg-brand-500"
            >
              <Text className="text-sm font-bold text-white">
                {isEn ? 'Log in' : 'ورود'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => logout()}
              className="flex-1 h-12 rounded-2xl items-center justify-center border-2 border-brand-500"
            >
              <Text className="text-sm font-bold text-brand-500">
                {isEn ? 'Register' : 'ثبت نام'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {commentsLoading ? (
        <View className="py-12 items-center">
          <ActivityIndicator color="#16a34a" />
        </View>
      ) : comments.length === 0 ? (
        <View className="items-center py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <Text className="text-3xl mb-3">🌱</Text>
          <Text className="text-sm font-bold text-slate-400 text-center px-6">
            {isEn
              ? 'No comments yet. Be the first!'
              : 'هنوز نظری نیست. اولین باشید!'}
          </Text>
        </View>
      ) : (
        <View>
          {comments.map((comment) => {
            const authorName =
              typeof comment.author === 'string'
                ? comment.author
                : comment.author?.username ||
                  comment.author?.first_name ||
                  'Anonymous';
            return (
              <View
                key={comment.id}
                className={`flex-row gap-3 bg-white dark:bg-slate-900/60 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-800 ${isEn ? '' : 'flex-row-reverse'}`}
              >
                <View className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/40 items-center justify-center">
                  <Text className="text-sm font-black text-brand-700 dark:text-brand-300">
                    {authorName[0]?.toUpperCase() || 'A'}
                  </Text>
                </View>
                <View className={`flex-1 ${isEn ? '' : 'items-end'}`}>
                  <View
                    className={`flex-row items-center gap-2 mb-1 ${isEn ? '' : 'flex-row-reverse'}`}
                  >
                    <Text className="text-sm font-bold text-slate-800 dark:text-white">
                      {authorName}
                    </Text>
                    <Text className="text-[10px] text-slate-400">
                      {formatDate(comment.created_at, i18n.language)}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm text-slate-600 dark:text-slate-300 leading-5 ${isEn ? 'text-left' : 'text-right'}`}
                  >
                    {comment.content}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

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
                className="w-9 h-9 items-center justify-center rounded-full"
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
                className="w-9 h-9 items-center justify-center rounded-full"
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
            <View className="absolute inset-x-0 bottom-0 h-32 bg-slate-50/30 dark:bg-slate-950/30" />
            <View className="absolute inset-x-0 bottom-0 h-20 bg-slate-50/70 dark:bg-slate-950/70" />
            <View className="absolute inset-x-0 bottom-0 h-10 bg-slate-50 dark:bg-slate-950" />
          </View>

          <View
            className="-mt-16 px-7 pt-2 pb-10 bg-slate-50 dark:bg-slate-950 rounded-t-[36px]"
            style={{ minHeight: 400 }}
          >
            {/* Meta chips */}
            <View
              className={`flex-row flex-wrap items-center gap-2 mb-5 ${isEn ? '' : 'flex-row-reverse'}`}
            >
              {post.category ? (
                <View className="bg-brand-100 dark:bg-brand-900/40 px-3 py-1.5 rounded-full">
                  <Text className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wide">
                    {post.category}
                  </Text>
                </View>
              ) : null}
              {post.tags?.map((tag: string) => (
                <View
                  key={tag}
                  className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    #{tag}
                  </Text>
                </View>
              ))}
              <View className="bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {formatDate(post.publish, i18n.language)}
                </Text>
              </View>
              <View
                className={`flex-row items-center gap-1 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 ${isEn ? '' : 'flex-row-reverse'}`}
              >
                <Clock size={12} color="#16a34a" />
                <Text className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {readTime} {isEn ? 'min read' : 'دقیقه مطالعه'}
                </Text>
              </View>
            </View>

            <Text
              className={`text-[28px] font-black text-slate-900 dark:text-white leading-[38px] mb-6 ${isEn ? 'text-left' : 'text-right'}`}
            >
              {title}
            </Text>

            {/* Author + stats */}
            <View
              className={`flex-row items-center justify-between mb-6 ${isEn ? '' : 'flex-row-reverse'}`}
            >
              <View
                className={`flex-row items-center gap-3 ${isEn ? '' : 'flex-row-reverse'}`}
              >
                <View className="w-11 h-11 rounded-2xl bg-brand-500 items-center justify-center shadow-lg shadow-brand-500/25">
                  <Text className="text-sm font-black text-white">
                    {authorInitials}
                  </Text>
                </View>
                <View className={isEn ? '' : 'items-end'}>
                  <Text className="text-sm font-bold text-slate-800 dark:text-white">
                    {post.author.first_name} {post.author.last_name}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    {isEn ? 'Author' : 'نویسنده'}
                  </Text>
                </View>
              </View>
              <View
                className={`flex-row items-center gap-4 ${isEn ? '' : 'flex-row-reverse'}`}
              >
                <View
                  className={`flex-row items-center gap-1 ${isEn ? '' : 'flex-row-reverse'}`}
                >
                  <Eye size={15} color="#94a3b8" />
                  <Text className="text-xs font-bold text-slate-400">
                    {post.view_count}
                  </Text>
                </View>
                <View
                  className={`flex-row items-center gap-1 ${isEn ? '' : 'flex-row-reverse'}`}
                >
                  <MessageCircle size={15} color="#94a3b8" />
                  <Text className="text-xs font-bold text-slate-400">
                    {commentCount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Like / Dislike / Share */}
            <View className="bg-white dark:bg-slate-900/60 rounded-3xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
              <Text
                className={`text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ${isEn ? 'text-left' : 'text-right'}`}
              >
                {isEn ? 'Was this helpful?' : 'آیا مفید بود؟'}
              </Text>
              <View
                className={`flex-row items-center justify-between ${isEn ? '' : 'flex-row-reverse'}`}
              >
                <View className={`flex-row gap-3 ${isEn ? '' : 'flex-row-reverse'}`}>
                  <Pressable
                    onPress={() => handleVote('like')}
                    disabled={voting}
                    className={`flex-row items-center gap-2 px-4 py-2.5 rounded-2xl border ${
                      userVote === 'like'
                        ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    <ThumbsUp
                      size={18}
                      color={userVote === 'like' ? '#16a34a' : '#94a3b8'}
                      fill={userVote === 'like' ? '#16a34a' : 'transparent'}
                    />
                    <Text
                      className={`text-sm font-bold ${userVote === 'like' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'}`}
                    >
                      {likes}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleVote('dislike')}
                    disabled={voting}
                    className={`flex-row items-center gap-2 px-4 py-2.5 rounded-2xl border ${
                      userVote === 'dislike'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    <ThumbsDown
                      size={18}
                      color={userVote === 'dislike' ? '#ef4444' : '#94a3b8'}
                      fill={userVote === 'dislike' ? '#ef4444' : 'transparent'}
                    />
                    <Text
                      className={`text-sm font-bold ${userVote === 'dislike' ? 'text-red-500' : 'text-slate-500'}`}
                    >
                      {dislikes}
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => setShowShareModal(true)}
                  className="w-11 h-11 rounded-2xl bg-brand-500 items-center justify-center shadow-lg shadow-brand-500/25"
                >
                  <Share2 size={18} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-white dark:bg-slate-900/60 rounded-2xl p-1 mb-6 border border-slate-100 dark:border-slate-800">
              {(['article', 'comments'] as TabKey[]).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => {
                    setActiveTab(tab);
                    Haptics.selectionAsync();
                  }}
                  className={`flex-1 py-3 rounded-xl ${
                    activeTab === tab ? 'bg-brand-500 shadow-sm' : ''
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-bold ${
                      activeTab === tab
                        ? 'text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab === 'article'
                      ? isEn
                        ? 'Article'
                        : 'مطلب'
                      : isEn
                        ? `Comments (${commentCount})`
                        : `نظرات (${commentCount})`}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Tab content — keep both mounted to avoid context issues on swap */}
            <View style={{ display: activeTab === 'article' ? 'flex' : 'none' }}>
              <View className="flex-row items-center gap-3 mb-6">
                <View className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <BookOpen size={16} color="#16a34a" />
                <View className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </View>

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
              </View>

              <View className="items-center mt-12 mb-6">
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-px bg-slate-200 dark:bg-slate-700" />
                  <Text className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[3px]">
                    {isEn ? 'End of article' : 'پایان مطلب'}
                  </Text>
                  <View className="w-8 h-px bg-slate-200 dark:bg-slate-700" />
                </View>
              </View>

              {relatedPosts.length > 0 && (
                <View className="mt-4">
                  <Text
                    className={`text-lg font-black text-slate-900 dark:text-white mb-4 ${isEn ? 'text-left' : 'text-right'}`}
                  >
                    {isEn ? 'Related Articles' : 'مقالات مرتبط'}
                  </Text>
                  <View>
                    {relatedPosts.map((related) => {
                      const relatedTitle =
                        isEn && related.title_en
                          ? related.title_en
                          : related.title;
                      return (
                        <TouchableOpacity
                          key={related.id}
                          onPress={() =>
                            navigation.push('BlogDetail', {
                              slug: related.slug,
                            })
                          }
                          className={`flex-row bg-white dark:bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 mb-3 ${isEn ? '' : 'flex-row-reverse'}`}
                        >
                          {related.cover_image ? (
                            <Image
                              source={{ uri: related.cover_image }}
                              className="w-24 h-24"
                              resizeMode="cover"
                            />
                          ) : null}
                          <View className="flex-1 p-3 justify-center">
                            <Text
                              className={`text-sm font-bold text-slate-800 dark:text-white leading-5 ${isEn ? 'text-left' : 'text-right'}`}
                              numberOfLines={2}
                            >
                              {relatedTitle}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            <View style={{ display: activeTab === 'comments' ? 'flex' : 'none' }}>
              {renderCommentsTab()}
            </View>
          </View>
        </Animated.ScrollView>
      </View>

      {/* Share modal */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowShareModal(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white dark:bg-slate-900 rounded-t-[32px] px-6 pt-6 pb-10">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-black text-slate-900 dark:text-white">
                  {isEn ? 'Share Article' : 'اشتراک‌گذاری'}
                </Text>
                <Pressable
                  onPress={() => setShowShareModal(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
                >
                  <X size={18} color="#64748b" />
                </Pressable>
              </View>

              <Pressable
                onPress={handleNativeShare}
                className="flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-3"
              >
                <View className="w-11 h-11 rounded-xl bg-brand-500 items-center justify-center">
                  <Share2 size={20} color="#fff" />
                </View>
                <Text className="text-base font-bold text-slate-800 dark:text-white">
                  {isEn ? 'Share via...' : 'اشتراک از طریق...'}
                </Text>
              </Pressable>

              <View className="flex-row gap-3 mt-2">
                {(
                  [
                    { key: 'telegram' as const, label: 'Telegram', color: '#0088cc' },
                    { key: 'whatsapp' as const, label: 'WhatsApp', color: '#25D366' },
                    { key: 'twitter' as const, label: 'X', color: '#1DA1F2' },
                  ] as const
                ).map(({ key, label, color }) => (
                  <Pressable
                    key={key}
                    onPress={() => openSocialShare(key)}
                    className="flex-1 items-center py-4 rounded-2xl bg-slate-50 dark:bg-slate-800"
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: color }}
                    >
                      <Share2 size={18} color="#fff" />
                    </View>
                    <Text className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
};

export default BlogDetailScreen;
