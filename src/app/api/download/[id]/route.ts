import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Content from '@/lib/models/Content';
import { blobService } from '@/lib/services/blob.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const content = await Content.findOne({
      _id: params.id,
      userId: (session.user as any).userId,
    });

    if (!content) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    if (!content.blobUrl) {
      return NextResponse.json({ error: 'HTML dosyası bulunamadı' }, { status: 404 });
    }

    // Get HTML from blob
    const htmlContent = await blobService.get(content.blobUrl);

    // Return as downloadable file
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${content.blobFilename || 'landing-page.html'}"`,
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Dosya indirilirken hata oluştu' }, { status: 500 });
  }
}

