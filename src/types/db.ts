// 查看数据库类型定义

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  email_hash?: string;
  bio?: string;
  avatar?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  rawContent?: string; // 原始 Markdown 内容
  author: string;
  tag?: string;
  comment_count?: number;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  content: string;
  raw_content?: string; // 原始 Markdown 内容
  author: string;
  author_avatar?: string; // 评论者头像
  floor_number?: number; // 楼层号
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}
