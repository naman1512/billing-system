// app/api/signature/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('Signature API called - checking for signature files...');
    
    // Try PNG first
    const pngPath = path.resolve(process.cwd(), 'public', 'sign.png');
    console.log('Checking PNG path:', pngPath);
    
    if (fs.existsSync(pngPath)) {
      console.log('PNG signature found, reading file...');
      const pngBuffer = fs.readFileSync(pngPath);
      const base64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;
      console.log('PNG signature loaded successfully, size:', pngBuffer.length, 'bytes');
      return NextResponse.json({ signature: base64 });
    }
    
    // Try JPG fallback
    const jpgPath = path.resolve(process.cwd(), 'public', 'sign.jpg');
    console.log('PNG not found, checking JPG path:', jpgPath);
    
    if (fs.existsSync(jpgPath)) {
      console.log('JPG signature found, reading file...');
      const jpgBuffer = fs.readFileSync(jpgPath);
      const base64 = `data:image/jpeg;base64,${jpgBuffer.toString('base64')}`;
      console.log('JPG signature loaded successfully, size:', jpgBuffer.length, 'bytes');
      return NextResponse.json({ signature: base64 });
    }
    
    // Not found
    console.warn('No signature image found at either PNG or JPG paths');
    return NextResponse.json(
      { signature: null, error: 'Signature image not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error loading signature image:', error);
    return NextResponse.json(
      { signature: null, error: 'Error loading signature image' },
      { status: 500 }
    );
  }
}
