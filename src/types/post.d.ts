export type Status = 'draft' | 'published' | 'archived';

export interface IPost {
    _key?: string;
    _scheme?: string
    postId?: number;
    title?: string;
    slug?: string;
    content?: string;
    blurb?: string;
    userid?: number;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
    categories?: string[];
    status?: Status;
    featuredImage?: string;
    views?: number;
    likes?: number;
    comments?: number;
    wordCount?: number;
    readTime?: string;
  }