// 블로그 관련 타입 정의

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string;
  tags: string[];
  author: string;
  draft?: boolean;
  body: string;
}

export interface PostCardProps {
  title: string;
  description: string;
  pubDate: Date;
  heroImage?: string;
  tags: string[];
  slug: string;
  author: string;
  content?: string;
}

export interface ReadingTime {
  minutes: number;
  words: number;
  text: string;
}

export interface SearchResult {
  item: BlogPost;
  score: number;
  matches?: Array<{
    indices: [number, number][];
    key: string;
    value: string;
  }>;
}

export interface LikeData {
  count: number;
  users: string[];
}

export interface LikeStorage {
  [postSlug: string]: LikeData;
}

export interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  author?: string;
  canonical?: string;
}

export interface NavigationPost {
  slug: string;
  title: string;
  description?: string;
}