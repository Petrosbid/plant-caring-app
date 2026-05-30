// src/types/blog.ts

export interface Author {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export interface BlogComment {
  id: number;
  author: string;
  content: string;
  created_at: string;
}

// Interface for the blog post list view
export interface PostListItem {
  view_count: number;
  date: string;
  published_date: string;
  category: string;
  meta_description_en: boolean | string | null;
  meta_description: string | null;
  views_count: number;
  id: number;
  title: string;
  title_en?: string | null;
  slug: string;
  author: Author;
  cover_image: string | null;
  publish: string; 
  excerpt: string;
  excerpt_en : string;
  likes_count?: number;
  dislikes_count?: number;
  comments_count?: number;
}

// Interface for the blog post detail view (extends list item)
export interface PostDetail extends Omit<PostListItem, 'excerpt'> {
  content: string;
  content_en?: string | null;
  updated: string; 
  meta_description: string;
  meta_description_en?: string | null;
  tags: string[];
  view_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  comments: BlogComment[];
  user_has_liked: boolean;
  user_has_disliked: boolean;
}
  