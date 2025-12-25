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
}

export interface PostListItemProps {
  title: string;
  description: string;
  pubDate: Date;
  heroImage?: string;
  tags: string[];
  slug: string;
  content?: string;
}
