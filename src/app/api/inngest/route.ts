import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { generateContent } from '@/lib/inngest/functions/generate-content';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateContent],
});

