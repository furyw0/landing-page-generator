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

    // Get HTML from blob if completed
    let htmlContent = null;
    if (content.status === 'completed' && content.blobUrl) {
      try {
        htmlContent = await blobService.get(content.blobUrl);
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

