import { sql } from '../db';

// Generated Content interface
export interface IGeneratedContent {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadges: string[];
  primaryButtonText: string;
  secondaryButtonText: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  securityTitle: string;
  securityDescription: string;
  article: {
    mainTitle: string;
    sections: Array<{
      h3: string;
      paragraphs: string[];
    }>;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  footerAbout: string;
  footerCopyright: string;
}

// Content interface (TypeScript type)
export interface IContent {
  id: number;
  user_id: number;
  keyword: string;
  derived_keywords: string[];
  main_url: string;
  hreflang_url: string;
  template_id: string;
  generated_content?: IGeneratedContent | null;
  blob_url?: string | null;
  blob_filename?: string | null;
  status: 'generating' | 'completed' | 'failed';
  error?: string | null;
  created_at: Date;
  completed_at?: Date | null;
  updated_at: Date;
}

// Content Data Access Object
export class Content {
  // Content oluştur
  static async create(data: {
    user_id: number;
    keyword: string;
    main_url: string;
    hreflang_url: string;
    template_id: string;
  }): Promise<IContent> {
    const result = await sql`
      INSERT INTO contents (user_id, keyword, main_url, hreflang_url, template_id, derived_keywords)
      VALUES (
        ${data.user_id}, 
        ${data.keyword}, 
        ${data.main_url}, 
        ${data.hreflang_url}, 
        ${data.template_id},
        ARRAY[]::TEXT[]
      )
      RETURNING *
    `;
    return result.rows[0] as IContent;
  }

  // ID'ye göre content bul
  static async findById(id: number): Promise<IContent | null> {
    const result = await sql`
      SELECT * FROM contents WHERE id = ${id} LIMIT 1
    `;
    return result.rows[0] as IContent || null;
  }

  // Kullanıcının tüm content'lerini getir
  static async findByUserId(
    userId: number,
    limit = 50,
    offset = 0
  ): Promise<IContent[]> {
    const result = await sql`
      SELECT * FROM contents 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result.rows as IContent[];
  }

  // Content güncelle
  static async updateById(
    id: number,
    data: Partial<{
      derived_keywords: string[];
      generated_content: IGeneratedContent;
      blob_url: string;
      blob_filename: string;
      status: 'generating' | 'completed' | 'failed';
      error: string;
      completed_at: Date;
    }>
  ): Promise<IContent | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.derived_keywords !== undefined) {
      updates.push(`derived_keywords = $${paramIndex++}`);
      values.push(data.derived_keywords);
    }

    if (data.generated_content !== undefined) {
      updates.push(`generated_content = $${paramIndex++}`);
      values.push(JSON.stringify(data.generated_content));
    }

    if (data.blob_url !== undefined) {
      updates.push(`blob_url = $${paramIndex++}`);
      values.push(data.blob_url);
    }

    if (data.blob_filename !== undefined) {
      updates.push(`blob_filename = $${paramIndex++}`);
      values.push(data.blob_filename);
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (data.error !== undefined) {
      updates.push(`error = $${paramIndex++}`);
      values.push(data.error);
    }

    if (data.completed_at !== undefined) {
      updates.push(`completed_at = $${paramIndex++}`);
      values.push(data.completed_at);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE contents 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.query(query, values);
    return result.rows[0] as IContent || null;
  }

  // Content sil
  static async deleteById(id: number, userId: number): Promise<boolean> {
    const result = await sql`
      DELETE FROM contents 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Status'e göre content'leri getir
  static async findByStatus(
    status: 'generating' | 'completed' | 'failed',
    limit = 50
  ): Promise<IContent[]> {
    const result = await sql`
      SELECT * FROM contents 
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows as IContent[];
  }

  // Kullanıcının content sayısını al
  static async countByUserId(userId: number): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count FROM contents WHERE user_id = ${userId}
    `;
    return parseInt(result.rows[0].count);
  }

  // Kullanıcı ve ID ile content bul (güvenlik için)
  static async findByIdAndUserId(
    id: number,
    userId: number
  ): Promise<IContent | null> {
    const result = await sql`
      SELECT * FROM contents 
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1
    `;
    return result.rows[0] as IContent || null;
  }
}

export default Content;
