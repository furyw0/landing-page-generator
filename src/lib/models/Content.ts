import { supabase } from '../supabase';

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
  id: string;
  user_id: string;
  prompt: string;
  template_name: string;
  generated_content?: any | null;
  html_url?: string | null;
  status: 'pending' | 'completed' | 'failed';
  inngest_event_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Content Data Access Object
export class Content {
  // Content oluştur
  static async create(data: {
    user_id: string;
    prompt: string;
    template_name: string;
    inngest_event_id?: string;
  }): Promise<IContent> {
    const { data: content, error } = await supabase
      .from('contents')
      .insert({
        user_id: data.user_id,
        prompt: data.prompt,
        template_name: data.template_name,
        inngest_event_id: data.inngest_event_id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return content as IContent;
  }

  // ID'ye göre content bul
  static async findById(id: string): Promise<IContent | null> {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data as IContent | null;
  }

  // Kullanıcının tüm content'lerini getir
  static async findByUserId(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<IContent[]> {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return data as IContent[];
  }

  // Content güncelle
  static async updateById(
    id: string,
    data: Partial<{
      generated_content: any;
      html_url: string;
      status: 'pending' | 'completed' | 'failed';
    }>
  ): Promise<IContent | null> {
    const { data: content, error } = await supabase
      .from('contents')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return content as IContent | null;
  }

  // Content sil
  static async deleteById(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    return !error;
  }

  // Status'e göre content'leri getir
  static async findByStatus(
    status: 'pending' | 'completed' | 'failed',
    limit = 50
  ): Promise<IContent[]> {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data as IContent[];
  }

  // Kullanıcının content sayısını al
  static async countByUserId(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('contents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  // Kullanıcı ve ID ile content bul (güvenlik için)
  static async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<IContent | null> {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data as IContent | null;
  }
}

export default Content;
