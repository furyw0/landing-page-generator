'use client';

import { TemplateConfig } from '@/lib/config/templates.config';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateConfig | null;
  onSelect: () => void;
}

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onSelect
}: TemplatePreviewModalProps) {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-[95vw] h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onSelect}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Bu Template'i Seç
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Kapat
            </button>
          </div>
        </div>

        {/* iFrame Preview */}
        <iframe
          src={template.demoUrl}
          className="w-full h-[calc(100%-80px)] border-0"
          title={`${template.name} Preview`}
        />
      </div>
    </div>
  );
}

