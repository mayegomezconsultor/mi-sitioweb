import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end('Method not allowed');
  }

  try {
    const filePath = resolve(process.cwd(), 'private/checklist-4-pilares.pdf');
    const pdfBuffer = await readFile(filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Checklist-4-Pilares-Maye-Gomez.pdf"');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error al entregar el PDF:', error);
    return res.status(404).send('Archivo no encontrado');
  }
}
