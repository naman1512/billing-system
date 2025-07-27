// pages/api/signature.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Try PNG first
    const pngPath = path.resolve(process.cwd(), 'public', 'sign.png');
    if (fs.existsSync(pngPath)) {
      const pngBuffer = fs.readFileSync(pngPath);
      const base64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;
      return res.status(200).json({ signature: base64 });
    }
    // Try JPG fallback
    const jpgPath = path.resolve(process.cwd(), 'public', 'sign.jpg');
    if (fs.existsSync(jpgPath)) {
      const jpgBuffer = fs.readFileSync(jpgPath);
      const base64 = `data:image/jpeg;base64,${jpgBuffer.toString('base64')}`;
      return res.status(200).json({ signature: base64 });
    }
    // Not found
    return res.status(404).json({ signature: null, error: 'Signature image not found' });
  } catch {
    return res.status(500).json({ signature: null, error: 'Error loading signature image' });
  }
}
