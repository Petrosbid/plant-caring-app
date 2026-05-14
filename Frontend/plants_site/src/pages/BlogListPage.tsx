// src/pages/BlogListPage.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import type { PostListItem } from '../types/blog';
import { useLanguageTheme } from '../contexts/LanguageThemeContext';
import { LoaderGooeyBlobs } from '../components/animation/gooey-loader';

const getUniqueCategories = (posts: PostListItem[]): string[] => {
  const cats = new Set<string>();
  posts.forEach(post => {
    const cat = (post as any).category || 'General';
    cats.add(cat);
  });
  return Array.from(cats).sort();
};

const PostCard: React.FC<{ post: PostListItem; language: 'en' | 'fa' }> = ({ post, language }) => {
  const title =  (language === 'en' ? post.title_en : post.title);
  const excerpt = (language === 'en' ? post.excerpt_en : post.excerpt) || (language === 'en' ? 'Read more...' : 'ادامه مطلب...');
  const date = post.published_date ? new Date(post.published_date).toLocaleDateString(language === 'en' ? 'en-US' : 'fa-IR') : '';
  const tags = (language === 'en' ? (post as any).tags_en : (post as any).tags) || (language === 'en' ? 'General' : 'عمومی') ;
  const tagsString = Array.isArray(tags) ? tags.join(',') : String(tags);
  const tagsArray = tagsString.split(',');
  const imageUrl = post.cover_image ;

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 dark:border-gray-700 hover:border-green-100 dark:hover:border-green-800">
      <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-700 h-48">
        <img
          src={imageUrl || ''}
          alt={title || '' }
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-start mb-2">
            {tagsArray.map((tag, index) => (
               <span key={index} className="mr-[9px] text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  {tag.trim()}
                </span>
              ))}
          {date && <time className="text-xs text-gray-500 dark:text-gray-400">{date}</time>}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 text-justify">{excerpt}</p>
        <div className="mt-auto">
          <a
            href={`/blog/${post.slug}`}
            className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors text-center"
          >
            {language === 'en' ? 'Read more →' : 'ادامه مطلب ←'}
          </a>
        </div>
      </div>
    </article>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  language: 'en' | 'fa';
}> = ({ currentPage, totalPages, onPageChange, language }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label={language === 'en' ? 'Previous page' : 'صفحه قبلی'}
      >
        {language === 'en' ? '← Previous' : 'قبلی →'}
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {language === 'en' ? `Page ${currentPage} of ${totalPages}` : `صفحه ${currentPage} از ${totalPages}`}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label={language === 'en' ? 'Next page' : 'صفحه بعدی'}
      >
        {language === 'en' ? 'Next →' : 'بعدی ←'}
      </button>
    </div>
  );
};

const BlogListPage: React.FC = () => {
  const { language } = useLanguageTheme();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/blog/posts/');
        const data = response.data.results || response.data;
        let postsData = Array.isArray(data) ? data : [];
        postsData = postsData.map((post: any) => ({
          ...post,
          category: post.category || ['Tech', 'Design', 'Productivity', 'General'][Math.floor(Math.random() * 4)]
        }));
        setPosts(postsData);
      } catch (err) {
        console.error(err);
        setError(language === 'en' ? 'Failed to load blog posts. Please try again later.' : 'خطا در بارگذاری مطالب. لطفاً دوباره تلاش کنید.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [language]);

  const categories = useMemo(() => {
    const unique = getUniqueCategories(posts);
    return ['All', ...unique];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (selectedCategory !== 'All') {
      result = result.filter(post => ((post as any).category || 'General') === selectedCategory);
    }
    if (debouncedSearch.trim() !== '') {
      const lowerQuery = debouncedSearch.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(lowerQuery) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(lowerQuery))
      );
    }
    return result;
  }, [posts, selectedCategory, debouncedSearch]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage, postsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearch]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
        <LoaderGooeyBlobs size={25} color="#10b981" duration={1} />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {language === 'fa' ? 'در حال بارگذاری...' : 'Loading posts...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition"
        >
          {language === 'en' ? 'Retry' : 'تلاش مجدد'}
        </button>
      </div>
    );
  }

  return (
    <div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-gray-50 dark:bg-gray-900 min-h-screen"
      dir={language === 'fa' ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8 lg:mb-12">
        {language === 'en' ? 'From the Blog' : 'وبلاگ'}
      </h1>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'en' ? 'Search articles...' : 'جستجوی مطالب...'}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            aria-label={language === 'en' ? 'Search posts' : 'جستجوی پست‌ها'}
          />
          <svg
            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 ${language === 'fa' ? 'right-3' : 'left-3'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ${language === 'fa' ? 'left-3' : 'right-3'}`}
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(cat => {
          const count = cat === 'All' ? posts.length : posts.filter(p => ((p as any).category || 'General') === cat).length;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isActive
                  ? 'bg-green-600 dark:bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              aria-pressed={isActive}
            >
              {cat} ({count})
            </button>
          );
        })}
        {(selectedCategory !== 'All' || searchTerm) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Clear all filters"
          >
            {language === 'en' ? 'Clear filters ✕' : 'پاک کردن فیلترها ✕'}
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        {language === 'en'
          ? `Showing ${paginatedPosts.length} of ${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''}`
          : `نمایش ${paginatedPosts.length} از ${filteredPosts.length} مطلب`}
      </div>

      {/* Post Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {language === 'en' ? 'No posts match your filters.' : 'هیچ مطلبی با فیلترهای شما مطابقت ندارد.'}
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-green-600 dark:text-green-400 underline hover:text-green-800 dark:hover:text-green-300"
          >
            {language === 'en' ? 'Clear filters' : 'پاک کردن فیلترها'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {paginatedPosts.map(post => (
              <PostCard key={post.id} post={post} language={language} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            language={language}
          />
        </>
      )}
    </div>
  );
};

export default BlogListPage;