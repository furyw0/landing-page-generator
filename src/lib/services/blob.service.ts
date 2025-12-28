import { put, del, head } from '@vercel/blob';

export class BlobService {
  async upload(htmlContent: string, filename: string): Promise<string> {
    try {
      const blob = await put(filename, htmlContent, {
        access: 'public',
        contentType: 'text/html',
      });

      return blob.url;
    } catch (error: any) {
      console.error('Blob upload error:', error);
      throw new Error(`Blob upload hatası: ${error.message}`);
    }
  }

  async get(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error: any) {
      console.error('Blob get error:', error);
      throw new Error(`Blob okuma hatası: ${error.message}`);
    }
  }

  async update(oldUrl: string, newContent: string, filename: string): Promise<string> {
    try {
      // Eski dosyayı sil
      await this.delete(oldUrl);

      // Yeni dosyayı upload et
      return await this.upload(newContent, filename);
    } catch (error: any) {
      console.error('Blob update error:', error);
      throw new Error(`Blob güncelleme hatası: ${error.message}`);
    }
  }

  async delete(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error: any) {
      console.error('Blob delete error:', error);
      throw new Error(`Blob silme hatası: ${error.message}`);
    }
  }

  async exists(url: string): Promise<boolean> {
    try {
      await head(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const blobService = new BlobService();

