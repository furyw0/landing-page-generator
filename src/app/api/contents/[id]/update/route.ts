import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Content from '@/lib/models/Content';
import { blobService } from '@/lib/services/blob.service';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { htmlContent } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'HTML content gerekli' }, { status: 400 });
    }

    const { id } = await params;
    const userId = parseInt((session.user as any).userId);
    const contentId = parseInt(id);

    const content = await Content.findByIdAndUserId(contentId, userId);

    if (!content) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    if (!content.blob_url || !content.blob_filename) {
      return NextResponse.json({ error: 'Blob URL bulunamadı' }, { status: 400 });
    }

    // Update blob
    const newBlobUrl = await blobService.update(content.blob_url, htmlContent, content.blob_filename);

    // Update database
    await Content.updateById(contentId, {
      blob_url: newBlobUrl,
    });

    return NextResponse.json({
      message: 'İçerik güncellendi',
      blobUrl: newBlobUrl,
    });
  } catch (error: any) {
    console.error('Update content error:', error);
    return NextResponse.json({ error: 'İçerik güncellenirken hata oluştu' }, { status: 500 });
  }
}
