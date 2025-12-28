import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Content from '@/lib/models/Content';
import { blobService } from '@/lib/services/blob.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).userId;

    const content = await Content.findByIdAndUserId(id, userId);

    if (!content) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    if (!content.html_url) {
      return NextResponse.json({ error: 'HTML dosyası bulunamadı' }, { status: 404 });
    }

    // Get HTML from blob
    const htmlContent = await blobService.get(content.html_url);

    // Return as downloadable file
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="landing-page-${content.id}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Dosya indirilirken hata oluştu' }, { status: 500 });
  }
}
