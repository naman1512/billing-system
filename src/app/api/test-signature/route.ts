// app/api/test-signature/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const pngPath = path.resolve(process.cwd(), 'public', 'sign.png');
    console.log('Testing signature path:', pngPath);
    console.log('File exists:', fs.existsSync(pngPath));
    
    if (fs.existsSync(pngPath)) {
      const stats = fs.statSync(pngPath);
      console.log('File size:', stats.size, 'bytes');
      console.log('File modified:', stats.mtime);
      
      // Return the image directly as base64 for testing
      const pngBuffer = fs.readFileSync(pngPath);
      const base64 = pngBuffer.toString('base64');
      
      return NextResponse.json({
        success: true,
        path: pngPath,
        exists: true,
        size: stats.size,
        base64Preview: base64.substring(0, 100) + '...',
        fullBase64Length: base64.length
      });
    } else {
      return NextResponse.json({
        success: false,
        path: pngPath,
        exists: false,
        error: 'File not found'
      });
    }
  } catch (error) {
    console.error('Test signature error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
