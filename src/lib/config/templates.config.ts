export interface TemplateSection {
  type: 'hero' | 'features' | 'article' | 'faq' | 'bonus' | 'testimonials' | 'games';
  count?: number;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    bg: string;
    accent: string;
  };
  sections: TemplateSection[];
  demoUrl: string;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'template-1',
    name: 'Premium Trust',
    description: 'Lüks casino teması - Premium kullanıcılar için',
    colors: {
      primary: '#D4AF37',
      bg: '#1A1A1A',
      accent: '#8B0000'
    },
    sections: [
      { type: 'hero' },
      { type: 'features', count: 6 },
      { type: 'article' },
      { type: 'faq', count: 6 }
    ],
    demoUrl: '/demos/template-1-demo.html'
  },
  {
    id: 'template-2',
    name: 'Modern Convert',
    description: 'Modern minimal tema - Yüksek conversion odaklı',
    colors: {
      primary: '#0066FF',
      bg: '#FFFFFF',
      accent: '#00C2FF'
    },
    sections: [
      { type: 'hero' },
      { type: 'bonus' },
      { type: 'features', count: 4 },
      { type: 'testimonials', count: 3 },
      { type: 'faq', count: 5 }
    ],
    demoUrl: '/demos/template-2-demo.html'
  },
  {
    id: 'template-3',
    name: 'Neon Gaming',
    description: 'Cyberpunk tema - Genç kitle için',
    colors: {
      primary: '#8338EC',
      bg: '#0D0221',
      accent: '#FF006E'
    },
    sections: [
      { type: 'hero' },
      { type: 'games', count: 8 },
      { type: 'bonus' },
      { type: 'article' },
      { type: 'faq', count: 6 }
    ],
    demoUrl: '/demos/template-3-demo.html'
  },
  {
    id: 'template-4',
    name: 'Classic Pro',
    description: 'Klasik profesyonel tema - Spor bahis odaklı',
    colors: {
      primary: '#006B3D',
      bg: '#F8F9FA',
      accent: '#FFB800'
    },
    sections: [
      { type: 'hero' },
      { type: 'features', count: 4 },
      { type: 'testimonials', count: 4 },
      { type: 'faq', count: 5 }
    ],
    demoUrl: '/demos/template-4-demo.html'
  },
  {
    id: 'template-5',
    name: 'Energy Fire',
    description: 'Energik dinamik tema - Aksiyon casino',
    colors: {
      primary: '#FF4500',
      bg: '#1C1C1C',
      accent: '#FFA500'
    },
    sections: [
      { type: 'hero' },
      { type: 'bonus' },
      { type: 'features', count: 6 },
      { type: 'article' },
      { type: 'testimonials', count: 3 },
      { type: 'faq', count: 6 }
    ],
    demoUrl: '/demos/template-5-demo.html'
  }
];

