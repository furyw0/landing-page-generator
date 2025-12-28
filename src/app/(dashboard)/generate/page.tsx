'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import tr from '@/lib/i18n/tr.json';
import { TEMPLATES, TemplateConfig } from '@/lib/config/templates.config';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';

export default function GeneratePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    templateId: '',
    siteName: '',
    mainUrl: '',
    hreflangUrl: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfig | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.templateId) {
      setError('Template seçimi zorunludur');
      return;
    }

    if (!formData.siteName || !formData.mainUrl || !formData.hreflangUrl) {
      setError('Tüm alanların doldurulması zorunludur');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('OpenAI API anahtarınızı ayarlardan ekleyin');
        } else {
          setError(data.error || 'İçerik üretimi başlatılamadı');
        }
      } else {
        router.push(`/contents/${data.contentId}?generating=true`);
      }
    } catch (error) {
      setError('İçerik üretimi başlatılamadı');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = (template: TemplateConfig) => {
    setPreviewTemplate(template);
  };

  const handleSelectFromPreview = () => {
    if (previewTemplate) {
      setFormData({ ...formData, templateId: previewTemplate.id });
      setPreviewTemplate(null);
    }
  };

  const selectedTemplate = TEMPLATES.find(t => t.id === formData.templateId);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">İçerik Üret</h2>
        <p className="text-gray-600">AI ile landing page içeriği oluşturun</p>
      </div>

      <div className="max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
              {error.includes('API anahtarı') && (
                <div className="mt-2">
                  <a href="/settings" className="text-blue-600 hover:text-blue-700 font-medium">
                    Ayarlara Git
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Template Seçin
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {TEMPLATES.map((template) => (
                <div key={template.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, templateId: template.id })}
                    className={`w-full group relative p-4 border-2 rounded-lg text-left transition-all ${
                      formData.templateId === template.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {/* Color Preview */}
                    <div className="flex gap-2 mb-3">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300" 
                        style={{ backgroundColor: template.colors.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded border border-gray-300" 
                        style={{ backgroundColor: template.colors.bg }}
                      />
                      <div 
                        className="w-6 h-6 rounded border border-gray-300" 
                        style={{ backgroundColor: template.colors.accent }}
                      />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{template.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                    
                    {/* Sections Badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.sections.slice(0, 3).map((section, i) => (
                        <span 
                          key={i} 
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                        >
                          {section.type}
                        </span>
                      ))}
                      {template.sections.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                          +{template.sections.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {formData.templateId === template.id && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                  
                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => handlePreview(template)}
                    className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Önizle
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Site Name */}
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
              Site Adı (Anahtar Kelime)
            </label>
            <input
              id="siteName"
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              placeholder="Örn: stake, bets10, meritking"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Otomatik olarak &quot;{formData.siteName || 'site adı'} giriş&quot;, &quot;{formData.siteName || 'site adı'} güncel giriş&quot;, &quot;{formData.siteName || 'site adı'} bonus&quot; keywordleri üretilecek
            </p>
          </div>

          {/* Main URL */}
          <div>
            <label htmlFor="mainUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Ana Site URL'si (Canonical)
            </label>
            <input
              id="mainUrl"
              type="url"
              value={formData.mainUrl}
              onChange={(e) => setFormData({ ...formData, mainUrl: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
            <p className="text-sm text-gray-500 mt-2">SEO için canonical URL</p>
          </div>

          {/* Hreflang URL */}
          <div>
            <label htmlFor="hreflangUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Hreflang URL'si (Alternatif Domain)
            </label>
            <input
              id="hreflangUrl"
              type="url"
              value={formData.hreflangUrl}
              onChange={(e) => setFormData({ ...formData, hreflangUrl: e.target.value })}
              placeholder="https://alternative-domain.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
            <p className="text-sm text-gray-500 mt-2">Alternatif dil/domain için hreflang URL</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {isGenerating ? 'İçerik Üretiliyor...' : 'İçerik Üret'}
          </button>
        </form>
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        onSelect={handleSelectFromPreview}
      />
    </div>
  );
}
