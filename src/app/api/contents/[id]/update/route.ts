import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Content from '@/lib/models/Content';
import { blobService } from '@/lib/services/blob.service';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { htmlContent } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'HTML content gerekli' }, { status: 400 });
    }

    await connectDB();

    const content = await Content.findOne({
      _id: params.id,
      userId: (session.user as any).userId,
    });

    if (!content) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    if (!content.blobUrl || !content.blobFilename) {
      return NextResponse.json({ error: 'Blob URL bulunamadı' }, { status: 400 });
    }

    // Update blob
    const newBlobUrl = await blobService.update(content.blobUrl, htmlContent, content.blobFilename);

    // Update database
    content.blobUrl = newBlobUrl;
    content.updatedAt = new Date();
    await content.save();

    return NextResponse.json({
      message: 'İçerik güncellendi',
      blobUrl: newBlobUrl,
    });
  } catch (error: any) {
    console.error('Update content error:', error);
    return NextResponse.json({ error: 'İçerik güncellenirken hata oluştu' }, { status: 500 });
  }
}

