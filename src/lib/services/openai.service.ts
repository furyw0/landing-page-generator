import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API hatası: ${error.message}`);
    }
  }

  async deriveKeywords(mainKeyword: string): Promise<string[]> {
    const prompt = `
Ana anahtar kelime: "${mainKeyword}"

Bu anahtar kelimeyi kullanarak Türkçe SEO uyumlu 8-10 türev kelime/phrase üret.
Casino/bahis teması için şu tarzda kelimeler:
- "${mainKeyword}"
- "${mainKeyword} giriş"
- "${mainKeyword} güncel adres"
- "${mainKeyword} casino"
- "${mainKeyword} bahis"
- "${mainKeyword} slot"
- "${mainKeyword} canlı casino"
vb.

Sadece virgülle ayrılmış liste dön, başka açıklama ekleme.
    `.trim();

    const response = await this.chat(
      [
        {
          role: 'system',
          content: 'Sen SEO keyword uzmanısın. Sadece virgülle ayrılmış kelime listesi döndürürsün.',
        },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 300 }
    );

    // Parse comma-separated keywords
    return response
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }
}

