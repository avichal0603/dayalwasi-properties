import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const propertyId = formData.get('propertyId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId || 'new'}-${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ path: data.path, url: publicUrl }, { status: 200 });
  } catch (err) {
    console.error('Unexpected upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
