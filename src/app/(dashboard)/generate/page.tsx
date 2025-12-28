'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import tr from '@/lib/i18n/tr.json';

const templates = [
  { id: 'template-1', name: 'Luxury Gold', description: 'Premium casino teması' },
  { id: 'template-2', name: 'Modern Blue', description: 'Modern minimal tema' },
  { id: 'template-3', name: 'Neon Purple', description: 'Cyberpunk casino' },
  { id: 'template-4', name: 'Classic Green', description: 'Klasik profesyonel' },
  { id: 'template-5', name: 'Orange Red', description: 'Energik casino' },
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
                  className={`p-6 border-2 rounded-lg text-left transition-colors ${
                    formData.templateId === template.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </button>
              ))}
            </div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

