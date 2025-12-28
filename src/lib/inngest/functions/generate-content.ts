import { inngest } from '../client';
import { OpenAIService } from '@/lib/services/openai.service';
import { ContentGeneratorService } from '@/lib/services/content-generator.service';
import { HTMLBuilderService } from '@/lib/services/html-builder.service';
import { blobService } from '@/lib/services/blob.service';
import { connectDB } from '@/lib/mongodb';
import Content from '@/lib/models/Content';
import User from '@/lib/models/User';
import { decrypt } from '@/lib/crypto';

export const generateContent = inngest.createFunction(
  {
    id: 'generate-content',
    retries: 2,
  },
  { event: 'content.generate' },
  async ({ event, step }) => {
    const { contentId, keyword, mainUrl, hreflangUrl, templateId, userId } = event.data;

    try {
      // Step 1: Kullanıcı bilgilerini al
      const user = await step.run('fetch-user', async () => {
        await connectDB();
        const user = await User.findById(userId);

        if (!user || !user.openaiApiKey) {
          throw new Error('OpenAI API key not configured');
        }

        return {
          apiKey: decrypt(user.openaiApiKey),
          model: user.selectedModel || 'gpt-4o-mini',
        };
      });

      // Step 2: OpenAI servisi başlat
      const openai = new OpenAIService(user.apiKey, user.model);

      // Step 3: Keyword türetme
      const derivedKeywords = await step.run('derive-keywords', async () => {
        return await openai.deriveKeywords(keyword);
      });

      // Step 4: Tüm içeriği üret
      const generatedContent = await step.run('generate-content', async () => {
        const generator = new ContentGeneratorService(openai, keyword, derivedKeywords);
        return await generator.generateAll();
      });

      // Step 5: HTML oluştur
      const html = await step.run('build-html', async () => {
        const builder = new HTMLBuilderService();
        return await builder.build(templateId, mainUrl, hreflangUrl, generatedContent);
      });

      // Step 6: Blob'a upload
      const { blobUrl, filename } = await step.run('upload-blob', async () => {
        const filename = `${keyword.replace(/\s+/g, '-')}_${Date.now()}.html`;
        const url = await blobService.upload(html, filename);
        return { blobUrl: url, filename };
      });

      // Step 7: Database güncelle
      await step.run('update-database', async () => {
        await Content.findByIdAndUpdate(contentId, {
          status: 'completed',
          blobUrl,
          blobFilename: filename,
          generatedContent,
          derivedKeywords,
          completedAt: new Date(),
        });
      });

      return { success: true, contentId };
    } catch (error: any) {
      // Hata durumunda DB'yi güncelle
      await step.run('mark-failed', async () => {
        await Content.findByIdAndUpdate(contentId, {
          status: 'failed',
          error: error.message,
        });
      });

      throw error;
    }
  }
);

