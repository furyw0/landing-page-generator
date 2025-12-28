'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import tr from '@/lib/i18n/tr.json';

export default function ContentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isGenerating = searchParams.get('generating') === 'true';

  const [content, setContent] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContent();
    
    // Poll every 5 seconds if generating
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(fetchContent, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, isGenerating]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/contents/${id}`);
      const data = await response.json();

      if (response.ok) {
        setContent(data.content);
        setHtmlContent(data.htmlContent);
        setError('');
      } else {
        setError(data.error || 'İçerik yüklenemedi');
      }
    } catch (error) {
      setError('İçerik yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/download/${id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `landing-page-${id}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-medium">Hata</p>
          <p>{error}</p>
          <Link href="/contents" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            ← İçeriklere Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
          <p>İçerik bulunamadı</p>
          <Link href="/contents" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            ← İçeriklere Dön
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Link href="/contents" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← İçeriklere Dön
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">İçerik Detayı</h2>
        </div>
        {content.status === 'completed' && (
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            HTML İndir
          </button>
        )}
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Durum</h3>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(content.status)}`}>
            {content.status === 'pending' ? 'Üretiliyor...' : 
             content.status === 'completed' ? 'Tamamlandı' : 
             content.status === 'failed' ? 'Başarısız' : content.status}
          </span>
        </div>

        {content.status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p>İçerik üretiliyor... Bu işlem birkaç dakika sürebilir.</p>
            </div>
          </div>
        )}

        {content.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Hata Oluştu</p>
            <p className="text-sm mt-1">İçerik üretimi sırasında bir hata oluştu. Lütfen tekrar deneyin.</p>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">İçerik Bilgileri</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Anahtar Kelime</p>
            <p className="font-medium text-gray-900">{content.prompt}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Template</p>
            <p className="font-medium text-gray-900">{content.template_name}</p>
          </div>
          {content.main_url && (
            <div>
              <p className="text-sm text-gray-500">Ana URL</p>
              <p className="font-medium text-gray-900 truncate">{content.main_url}</p>
            </div>
          )}
          {content.hreflang_url && (
            <div>
              <p className="text-sm text-gray-500">Hreflang URL</p>
              <p className="font-medium text-gray-900 truncate">{content.hreflang_url}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Oluşturulma Tarihi</p>
            <p className="font-medium text-gray-900">
              {new Date(content.created_at).toLocaleString('tr-TR')}
            </p>
          </div>
          {content.status === 'completed' && content.updated_at && (
            <div>
              <p className="text-sm text-gray-500">Tamamlanma Tarihi</p>
              <p className="font-medium text-gray-900">
                {new Date(content.updated_at).toLocaleString('tr-TR')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* HTML Preview */}
      {content.status === 'completed' && htmlContent && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">HTML Önizleme</h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <iframe
              srcDoc={htmlContent}
              className="w-full h-[600px] bg-white"
              title="HTML Preview"
              sandbox="allow-scripts"
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            İçeriği indirip kendi sitenizde kullanabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}

