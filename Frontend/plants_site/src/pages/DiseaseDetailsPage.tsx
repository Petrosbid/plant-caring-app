// src/pages/DiseaseDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  FiAlertCircle, FiClipboard, FiShield, FiActivity, FiSend,
  FiShare2, FiArrowLeft, FiEye, FiMessageCircle,
  FiChevronDown, FiChevronUp, FiGrid
} from 'react-icons/fi';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { LoaderGooeyBlobs } from '../components/animation/gooey-loader';
import { diseaseService, diseaseCommentService } from '../services/api';
import type { Disease, DiseaseComment } from '../types';
import { formatDate } from '../utils/date';

const DiseaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguageTheme();
  const isEn = language === 'en';

  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<DiseaseComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showTreatment, setShowTreatment] = useState(false);
  const [showPrevention, setShowPrevention] = useState(false);

  const isLoggedIn = !!localStorage.getItem('access_token');


  useEffect(() => {
    const fetchDisease = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await diseaseService.getDiseaseById(parseInt(id));
        setDisease(data);
        // بارگذاری کامنت‌ها
        const commentsData = await diseaseCommentService.getComments(parseInt(id));
        setComments(commentsData);
      } catch (err) {
        setError(isEn ? 'Failed to load disease.' : 'خطا در بارگذاری بیماری.');
      } finally {
        setLoading(false);
      }
    };
    fetchDisease();
  }, [id, isEn]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: disease?.name_fa || disease?.name || '',
          text: disease?.description,
          url: window.location.href,
        });
      } catch { }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isEn ? 'Link copied!' : 'لینک کپی شد!');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !disease) return;
    try {
      const res = await diseaseCommentService.addComment(disease.id, newComment);
      setNewComment('');
      setComments(prev => [res, ...prev]);
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyContent.trim() || !disease) return;
    try {
      await diseaseCommentService.addComment(disease.id, replyContent, parentId);
      setReplyTo(null);
      setReplyContent('');
      // به‌روزرسانی کل کامنت‌ها
      const refreshed = await diseaseCommentService.getComments(disease.id);
      setComments(refreshed);
    } catch (err) {
      console.error('Reply failed', err);
    }
  };

  // تابع کمکی برای تبدیل رشته کاما جدا شده به آرایه و نمایش به صورت برچسب
  const renderAffectedPlants = (plantsStr: string | undefined) => {
    if (!plantsStr) return null;
    const plantsArray = plantsStr.split(',').map(p => p.trim()).filter(p => p);
    if (plantsArray.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {plantsArray.map((plant, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full text-sm bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
          >
            {plant}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoaderGooeyBlobs size={40} color="#10b981" />
      </div>
    );
  }
  if (error || !disease) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">⚠️</span>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
          {error || (isEn ? 'Disease not found' : 'بیماری یافت نشد')}
        </h2>
        <button
          onClick={() => navigate('/library')}
          className="mt-4 text-green-600 hover:underline"
        >
          ← {isEn ? 'Back to Library' : 'بازگشت به کتابخانه'}
        </button>
      </div>
    );
  }

  const name = isEn ? (disease.name) : (disease.name_fa || disease.name);
  const description = isEn ? disease.description : (disease.description_fa || disease.description);
  const symptoms = isEn ? disease.symptoms : (disease.symptoms_fa || disease.symptoms);
  const solution = isEn ? disease.solution : (disease.solution_fa || disease.solution);
  const prevention = isEn ? disease.prevention_methods : (disease.prevention_methods_fa || disease.prevention_methods);
  const severityColor = {
    low: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    critical: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  }[disease.severity_level] || 'text-slate-600 bg-slate-100';

  const spreadRateLabel = isEn
    ? { slow: 'Slow', moderate: 'Moderate', fast: 'Fast' }[disease.spread_rate]
    : { slow: 'کند', moderate: 'متوسط', fast: 'سریع' }[disease.spread_rate];

  const llm = disease.llm_analysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 sm:px-6" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="max-w-6xl mx-auto">
        {/* دکمه بازگشت */}
        <button
          onClick={() => navigate('/library')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-green-600 mb-6 transition"
        >
          <FiArrowLeft className={isEn ? '' : 'rotate-180'} />
          <span>{isEn ? 'Back to Library' : 'بازگشت به کتابخانه'}</span>
        </button>

        {/* هدر بیماری */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 dark:border-slate-700/50 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-8 text-white">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold mb-2">{name}</h1>
                {disease.name_fa && !isEn && disease.name && (
                  <p className="text-white/80 text-sm">{disease.name}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityColor}`}>
                {isEn ? `Severity: ${disease.severity_level}` : `شدت: ${{
                  low: 'کم', medium: 'متوسط', high: 'زیاد', critical: 'بحرانی'
                }[disease.severity_level]}`}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                {isEn ? `Spread: ${spreadRateLabel}` : `سرایت: ${spreadRateLabel}`}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 flex items-center gap-1">
                <FiEye className="w-4 h-4" /> {disease.view_count.toLocaleString()}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 flex items-center gap-1">
                <FiMessageCircle className="w-4 h-4" /> {disease.comment_count || comments.length}
              </span>
            </div>
          </div>

          {/* محتوای اصلی */}
          <div className="p-6 space-y-6">
            {/* توضیحات */}
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FiAlertCircle className="text-red-500" />
                {isEn ? 'Description' : 'توضیحات'}
              </h2>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />
            </div>

            {/* علائم */}
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FiActivity className="text-orange-500" />
                {isEn ? 'Symptoms' : 'علائم'}
              </h2>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(symptoms) }} />
            </div>

            {/* ===== بخش جدید: گیاهان آسیب‌دیده ===== */}
            {disease.affected_plants_list && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                  <FiGrid className="text-emerald-600" />
                  {isEn ? 'Affected Plants' : 'گیاهان آسیب‌دیده'}
                </h2>
                {renderAffectedPlants(disease.affected_plants_list)}
              </div>
            )}

            {/* راه حل درمان */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <button
                onClick={() => setShowTreatment(!showTreatment)}
                className="flex justify-between items-center w-full text-left"
              >
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FiClipboard className="text-green-600" />
                  {isEn ? 'Treatment' : 'درمان'}
                </h2>
                {showTreatment ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <AnimatePresence>
                {showTreatment && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 prose dark:prose-invert max-w-none"
                  >
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(solution) }} />
                    {/* اگر تحلیل LLM موجود باشد و شامل steps باشد، نمایش می‌دهیم */}
                    {llm && (llm.treatment_steps_en?.length || llm.treatment_steps_fa?.length) && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mt-4">
                        <h3 className="font-semibold text-green-800 dark:text-green-300">
                          {isEn ? 'Step-by-step treatment:' : 'درمان گام به گام:'}
                        </h3>
                        <ul className="list-decimal pl-5 mt-2 space-y-1">
                          {(isEn ? llm.treatment_steps_en : llm.treatment_steps_fa)?.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* پیشگیری */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <button
                onClick={() => setShowPrevention(!showPrevention)}
                className="flex justify-between items-center w-full text-left"
              >
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FiShield className="text-blue-600" />
                  {isEn ? 'Prevention' : 'پیشگیری'}
                </h2>
                {showPrevention ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              <AnimatePresence>
                {showPrevention && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 prose dark:prose-invert max-w-none"
                  >
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(prevention) }} />
                    {llm && llm.prevention_en && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mt-4">
                        <p>{isEn ? llm.prevention_en : llm.prevention_fa}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* بخش کامنت‌ها (مشابه گیاه) */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <FiMessageCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              {isEn ? `Comments (${comments.length})` : `نظرات (${comments.length})`}
            </h3>
          </div>

          {isLoggedIn ? (
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder={isEn ? 'Share your experience or question...' : 'تجربه یا سوال خود را بنویسید...'}
                rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="submit"
                className="mt-2 px-5 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition flex items-center gap-2"
              >
                <FiSend className="w-4 h-4" />
                {isEn ? 'Post Comment' : 'ارسال نظر'}
              </button>
            </form>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4 text-center mb-6">
              <p className="text-slate-600 dark:text-slate-300">
                {isEn ? 'Please login to comment.' : 'برای ثبت نظر وارد شوید.'}
              </p>
              <Link to="/login" className="text-green-600 hover:underline mt-1 inline-block">
                {isEn ? 'Log in' : 'ورود'}
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <AnimatePresence>
              {comments.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  🌱 {isEn ? 'No comments yet. Be the first!' : 'هنوز نظری نیست. اولین نفر باشید!'}
                </p>
              ) : (
                comments.map(comment => (
                  <DiseaseCommentItem
                    key={comment.id}
                    comment={comment}
                    isEn={isEn}
                    depth={0}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    handleReply={handleReply}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const DiseaseCommentItem: React.FC<{
  comment: DiseaseComment;
  isEn: boolean;
  depth: number;
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (val: string) => void;
  handleReply: (parentId: number) => void;
}> = ({ comment, isEn, depth, replyTo, setReplyTo, replyContent, setReplyContent, handleReply }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex gap-3 ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700' : ''}`}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
        {comment.user_name[0]?.toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 dark:text-slate-200">{comment.user_name}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(comment.created_at, isEn ? 'en' : 'fa')}</span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 mt-1">{comment.content}</p>
        <button
          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
          className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1"
        >
          {isEn ? 'Reply' : 'پاسخ'}
        </button>
        {replyTo === comment.id && (
          <div className="mt-2">
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder={isEn ? 'Write a reply...' : 'پاسخ خود را بنویسید...'}
              rows={2}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm"
            />
            <button
              onClick={() => handleReply(comment.id)}
              className="mt-1 px-3 py-1 rounded-lg bg-green-600 text-white text-xs"
            >
              {isEn ? 'Send' : 'ارسال'}
            </button>
          </div>
        )}
        {comment.replies?.map(reply => (
          <DiseaseCommentItem
            key={reply.id}
            comment={reply}
            isEn={isEn}
            depth={depth + 1}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleReply={handleReply}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default DiseaseDetailsPage;