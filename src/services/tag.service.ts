import { D1Database } from '@cloudflare/workers-types'
import { Tag } from '../types'

export class TagService {
  private static instance: TagService | null = null;
  
  // 单例模式实现
  static getInstance(db: D1Database): TagService {
    if (!TagService.instance) {
      TagService.instance = new TagService(db);
    }
    return TagService.instance;
  }

  constructor(private db: D1Database) {}

  async getAllTags(): Promise<Tag[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM tags ORDER BY name ASC'
    ).all<Tag>()
    return results
  }

  async getAllTagsWithPostCount(): Promise<(Tag & { post_count: number })[]> {
    const { results } = await this.db.prepare(`
      SELECT t.*, COUNT(p.id) as post_count 
      FROM tags t
      LEFT JOIN posts p ON t.name = p.tag
      GROUP BY t.id
      ORDER BY t.name ASC
    `).all<Tag & { post_count: number }>()
    return results
  }

  async getTagById(id: number): Promise<Tag | null> {
    const tag = await this.db.prepare(
      'SELECT * FROM tags WHERE id = ?'
    ).bind(id).first<Tag>()
    return tag
  }

  async getTagByName(name: string): Promise<Tag | null> {
    const tag = await this.db.prepare(
      'SELECT * FROM tags WHERE name = ?'
    ).bind(name).first<Tag>()
    return tag
  }

  async createTag(name: string): Promise<number> {
    const result = await this.db.prepare(
      'INSERT INTO tags (name) VALUES (?) RETURNING id'
    ).bind(name).first<{ id: number }>()
    return result?.id || 0
  }

  async updateTag(id: number, name: string): Promise<boolean> {
    const result = await this.db.prepare(
      'UPDATE tags SET name = ? WHERE id = ?'
    ).bind(name, id).run()
    
    return result.success
  }

  async deleteTag(id: number): Promise<boolean> {
    const result = await this.db.prepare(
      'DELETE FROM tags WHERE id = ?'
    ).bind(id).run()
    
    return result.success
  }
}
