import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Content from '@/lib/models/Content';
import { sql } from '@/lib/db';

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

    const userId = parseInt((session.user as any).userId);
    const offset = (page - 1) * limit;

    // Build query with filters
    let query = `
      SELECT id, user_id, keyword, derived_keywords, main_url, hreflang_url, 
             template_id, blob_url, blob_filename, status, error, 
             completed_at, created_at, updated_at
      FROM contents 
      WHERE user_id = $1
    `;

    const params: any[] = [userId];
    let paramIndex = 2;

    if (search) {
      query += ` AND keyword ILIKE $${paramIndex++}`;
      params.push(`%${search}%`);
    }

    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await sql.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM contents WHERE user_id = $1`;
    const countParams: any[] = [userId];
    let countParamIndex = 2;

    if (search) {
      countQuery += ` AND keyword ILIKE $${countParamIndex++}`;
      countParams.push(`%${search}%`);
    }

    if (status && status !== 'all') {
      countQuery += ` AND status = $${countParamIndex++}`;
      countParams.push(status);
    }

    const countResult = await sql.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      contents: result.rows,
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

    const userId = parseInt((session.user as any).userId);
    const contentId = parseInt(id);

    const deleted = await Content.deleteById(contentId, userId);

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
