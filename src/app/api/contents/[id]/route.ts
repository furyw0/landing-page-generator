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
    const userId = parseInt((session.user as any).userId);
    const contentId = parseInt(id);

    const content = await Content.findByIdAndUserId(contentId, userId);

    if (!content) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    // Get HTML from blob if completed
    let htmlContent = null;
    if (content.status === 'completed' && content.blob_url) {
      try {
        htmlContent = await blobService.get(content.blob_url);
      } catch (error) {
        console.error('Error fetching HTML from blob:', error);
      }
    }

    return NextResponse.json({
      content,
      htmlContent,
    });
  } catch (error: any) {
    console.error('Get content error:', error);
    return NextResponse.json({ error: 'İçerik alınırken hata oluştu' }, { status: 500 });
  }
}
