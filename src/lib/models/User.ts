import { sql } from '../db';

// User interface (TypeScript type)
export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  openai_api_key?: string | null;
  selected_model: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  role: string;
  created_at: Date;
  updated_at: Date;
}

// User Data Access Object
export class User {
  // Kullanıcı oluştur
  static async create(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<IUser> {
    const result = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${data.name}, ${data.email.toLowerCase()}, ${data.password}, ${data.role || 'user'})
      RETURNING *
    `;
    return result.rows[0] as IUser;
  }

  // Email'e göre kullanıcı bul
  static async findByEmail(email: string): Promise<IUser | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;
    return result.rows[0] as IUser || null;
  }

  // ID'ye göre kullanıcı bul
  static async findById(id: number): Promise<IUser | null> {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    return result.rows[0] as IUser || null;
  }

  // Kullanıcı güncelle
  static async updateById(
    id: number,
    data: Partial<{
      name: string;
      openai_api_key: string;
      selected_model: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
    }>
  ): Promise<IUser | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.openai_api_key !== undefined) {
      updates.push(`openai_api_key = $${paramIndex++}`);
      values.push(data.openai_api_key);
    }

    if (data.selected_model !== undefined) {
      updates.push(`selected_model = $${paramIndex++}`);
      values.push(data.selected_model);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.query(query, values);
    return result.rows[0] as IUser || null;
  }

  // Kullanıcı sil
  static async deleteById(id: number): Promise<boolean> {
    const result = await sql`
      DELETE FROM users WHERE id = ${id}
    `;
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Tüm kullanıcıları listele (admin için)
  static async findAll(limit = 50, offset = 0): Promise<IUser[]> {
    const result = await sql`
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result.rows as IUser[];
  }

  // Email varlığını kontrol et
  static async emailExists(email: string): Promise<boolean> {
    const result = await sql`
      SELECT EXISTS(SELECT 1 FROM users WHERE email = ${email.toLowerCase()})
    `;
    return result.rows[0].exists;
  }
}

export default User;
