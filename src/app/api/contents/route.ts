import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Content from '@/lib/models/Content';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const userId = (session.user as any).userId;
    const offset = (page - 1) * limit;

    // Get contents using Supabase
    const contents = await Content.findByUserId(userId, limit, offset);
    const total = await Content.countByUserId(userId);

    return NextResponse.json({
      contents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get contents error:', error);
    return NextResponse.json({ error: 'İçerikler alınırken hata oluştu' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Content ID gerekli' }, { status: 400 });
    }

    const userId = (session.user as any).userId;

    const deleted = await Content.deleteById(id, userId);

    if (!deleted) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    // TODO: Delete from Blob storage as well
    // if (content.blobUrl) {
    //   await blobService.delete(content.blobUrl);
    // }

    return NextResponse.json({ message: 'İçerik silindi' });
  } catch (error: any) {
    console.error('Delete content error:', error);
    return NextResponse.json({ error: 'İçerik silinirken hata oluştu' }, { status: 500 });
  }
}
