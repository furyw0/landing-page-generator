import { supabase } from '../supabase';

// User interface (TypeScript type)
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  openai_api_key?: string | null;
  selected_model: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  role: string;
  created_at: string;
  updated_at: string;
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
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        role: data.role || 'user',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return user as IUser;
  }

  // Email'e göre kullanıcı bul
  static async findByEmail(email: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    
    return data as IUser | null;
  }

  // ID'ye göre kullanıcı bul
  static async findById(id: string): Promise<IUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data as IUser | null;
  }

  // Kullanıcı güncelle
  static async updateById(
    id: string,
    data: Partial<{
      name: string;
      openai_api_key: string;
      selected_model: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
    }>
  ): Promise<IUser | null> {
    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return user as IUser | null;
  }

  // Kullanıcı sil
  static async deleteById(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Tüm kullanıcıları listele (admin için)
  static async findAll(limit = 50, offset = 0): Promise<IUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return data as IUser[];
  }

  // Email varlığını kontrol et
  static async emailExists(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    return !!data && !error;
  }
}

export default User;
