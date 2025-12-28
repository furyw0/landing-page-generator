import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Content from '@/lib/models/Content';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    await connectDB();

    // Build query
    const query: any = { userId: (session.user as any).userId };
    
    if (search) {
      query.keyword = { $regex: search, $options: 'i' };
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get contents
    const contents = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-generatedContent');

    const total = await Content.countDocuments(query);

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

    await connectDB();

    const content = await Content.findOneAndDelete({
      _id: id,
      userId: (session.user as any).userId,
    });

    if (!content) {
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

