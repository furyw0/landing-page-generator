'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import tr from '@/lib/i18n/tr.json';

const templates = [
  { 
    id: 'template-1', 
    name: 'Luxury Gold', 
    description: 'Premium casino teması',
    preview: '/previews/template-1.png',
    colors: {
      primary: '#D4AF37',
      bg: '#1A1A1A',
      accent: '#8B0000'
    }
  },
  { 
    id: 'template-2', 
    name: 'Modern Blue', 
    description: 'Modern minimal tema',
    preview: '/previews/template-2.png',
    colors: {
      primary: '#0066FF',
      bg: '#FFFFFF',
      accent: '#00C2FF'
    }
  },
  { 
    id: 'template-3', 
    name: 'Neon Purple', 
    description: 'Cyberpunk casino',
    preview: '/previews/template-3.png',
    colors: {
      primary: '#FF006E',
      bg: '#0D0221',
      accent: '#8338EC'
    }
  },
  { 
    id: 'template-4', 
    name: 'Classic Green', 
    description: 'Klasik profesyonel',
    preview: '/previews/template-4.png',
    colors: {
      primary: '#006B3D',
      bg: '#F8F9FA',
      accent: '#FFB800'
    }
  },
  { 
    id: 'template-5', 
    name: 'Orange Red', 
    description: 'Energik casino',
    preview: '/previews/template-5.png',
    colors: {
      primary: '#FF4500',
      bg: '#1C1C1C',
      accent: '#FFA500'
    }
  },
];

export default function GeneratePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    templateId: '',
    keyword: '',
    mainUrl: '',
    hreflangUrl: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.templateId) {
      setError(tr.generate.templateRequired);
      return;
    }

    if (!formData.keyword || !formData.mainUrl || !formData.hreflangUrl) {
      setError(tr.generate.allFieldsRequired);
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
          setError(tr.generate.apiKeyRequired);
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

  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{tr.generate.title}</h2>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
              {error === tr.generate.apiKeyRequired && (
                <div className="mt-2">
                  <a href="/settings" className="text-blue-600 hover:text-blue-700 font-medium">
                    {tr.generate.goToSettings}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Template Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              {tr.generate.selectTemplate}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, templateId: template.id })}
                  className={`group relative p-4 border-2 rounded-lg text-left transition-all ${
                    formData.templateId === template.id
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Color Preview */}
                  <div className="flex gap-2 mb-3">
                    <div 
                      className="w-8 h-8 rounded border border-gray-300" 
                      style={{ backgroundColor: template.colors.primary }}
                      title="Primary Color"
                    />
                    <div 
                      className="w-8 h-8 rounded border border-gray-300" 
                      style={{ backgroundColor: template.colors.bg }}
                      title="Background Color"
                    />
                    <div 
                      className="w-8 h-8 rounded border border-gray-300" 
                      style={{ backgroundColor: template.colors.accent }}
                      title="Accent Color"
                    />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  
                  {formData.templateId === template.id && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Seçili Tema Önizleme: {selectedTemplate.name}
                </h4>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Primary</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-12 h-12 rounded border border-gray-300" 
                          style={{ backgroundColor: selectedTemplate.colors.primary }}
                        />
                        <span className="text-sm font-mono text-gray-700">
                          {selectedTemplate.colors.primary}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Background</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-12 h-12 rounded border border-gray-300" 
                          style={{ backgroundColor: selectedTemplate.colors.bg }}
                        />
                        <span className="text-sm font-mono text-gray-700">
                          {selectedTemplate.colors.bg}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Accent</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-12 h-12 rounded border border-gray-300" 
                          style={{ backgroundColor: selectedTemplate.colors.accent }}
                        />
                        <span className="text-sm font-mono text-gray-700">
                          {selectedTemplate.colors.accent}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedTemplate.description} - Bu tema ile landing page'iniz oluşturulacak.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Keyword */}
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
              {tr.generate.keyword}
            </label>
            <input
              id="keyword"
              type="text"
              value={formData.keyword}
              onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
              placeholder={tr.generate.keywordPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
            <p className="text-sm text-gray-500 mt-2">{tr.generate.keywordHelp}</p>
          </div>

          {/* Main URL */}
          <div>
            <label htmlFor="mainUrl" className="block text-sm font-medium text-gray-700 mb-2">
              {tr.generate.mainUrl}
            </label>
            <input
              id="mainUrl"
              type="url"
              value={formData.mainUrl}
              onChange={(e) => setFormData({ ...formData, mainUrl: e.target.value })}
              placeholder={tr.generate.mainUrlPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
            <p className="text-sm text-gray-500 mt-2">{tr.generate.mainUrlHelp}</p>
          </div>

          {/* Hreflang URL */}
          <div>
            <label htmlFor="hreflangUrl" className="block text-sm font-medium text-gray-700 mb-2">
              {tr.generate.hreflangUrl}
            </label>
            <input
              id="hreflangUrl"
              type="url"
              value={formData.hreflangUrl}
              onChange={(e) => setFormData({ ...formData, hreflangUrl: e.target.value })}
              placeholder={tr.generate.hreflangUrlPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              required
            />
            <p className="text-sm text-gray-500 mt-2">{tr.generate.hreflangUrlHelp}</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {isGenerating ? tr.generate.generating : tr.generate.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
